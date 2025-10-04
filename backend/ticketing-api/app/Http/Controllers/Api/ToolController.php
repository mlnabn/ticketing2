<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Tool;
use App\Models\Ticket;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
use App\Models\MasterBarang;

class ToolController extends Controller
{
    /**
     * Menampilkan semua alat.
     */
    public function index()
    {
        return Tool::latest()->get();
    }

    /**
     * Mengambil aktivitas peminjaman terakhir.
     */
    public function getRecentActivity()
    {
        $activity = DB::table('ticket_tool')
            ->join('tools', 'ticket_tool.tool_id', '=', 'tools.id')
            ->join('tickets', 'ticket_tool.ticket_id', '=', 'tickets.id')
            ->leftJoin('users', 'tickets.user_id', '=', 'users.id')
            ->select(
                'tools.name as tool_name',
                'users.name as admin_name',
                'tickets.title as ticket_title',
                'ticket_tool.quantity_used',
                'ticket_tool.status as loan_status',
                'ticket_tool.created_at as activity_time'
            )
            ->orderBy('ticket_tool.created_at', 'desc')
            ->limit(10)
            ->get();

        return response()->json($activity);
    }

    /**
     * Mengambil laporan barang hilang dengan perhitungan Stok Awal yang akurat.
     */
    public function getLostItemsReport()
    {
        $netLosses = DB::table('ticket_tool')
            ->select(
                'tool_id',
                DB::raw('SUM(quantity_lost - quantity_recovered) as total_net_lost')
            )
            ->groupBy('tool_id');

        $report = DB::table('ticket_tool')
            ->join('tickets', 'ticket_tool.ticket_id', '=', 'tickets.id')
            ->join('tools', 'ticket_tool.tool_id', '=', 'tools.id')
            ->leftJoin('master_barangs', 'tools.name', '=', 'master_barangs.nama_barang')
            ->leftJoin('users', 'tickets.user_id', '=', 'users.id')
            ->leftJoinSub($netLosses, 'losses', function ($join) {
                $join->on('ticket_tool.tool_id', '=', 'losses.tool_id');
            })
            ->where('ticket_tool.quantity_lost', '>', 0)
            ->select(
                'tools.name as tool_name',
                'users.name as admin_name',
                'tickets.title as ticket_title',
                'ticket_tool.created_at as borrowed_at',
                'tickets.completed_at as returned_at',
                DB::raw('COALESCE(master_barangs.stok + losses.total_net_lost, master_barangs.stok) as stock_awal'),
                'ticket_tool.quantity_used as dipinjam',
                'ticket_tool.quantity_lost',
                'ticket_tool.quantity_recovered',
                'master_barangs.stok as stock_akhir',
                'ticket_tool.status as loan_status',
                'ticket_tool.keterangan',
                'ticket_tool.ticket_id',
                'ticket_tool.tool_id'
            )
            ->orderBy('ticket_tool.created_at', 'desc')
            ->get();

        return response()->json($report);
    }

    /**
     * Mengambil daftar alat yang statusnya hilang untuk proses pemulihan.
     */
    public function getLostItems()
    {
        $lostTools = Tool::whereHas('tickets', function ($query) {
            $query->whereIn('ticket_tool.status', ['hilang', 'kembali sebagian', 'dipulihkan sebagian']);
        })
            ->with(['tickets' => function ($query) {
                $query->whereIn('ticket_tool.status', ['hilang', 'kembali sebagian', 'dipulihkan sebagian']);
            }])
            ->get();

        $response = $lostTools->map(function ($tool) {
            return [
                'id' => $tool->id,
                'name' => $tool->name,
                'lost_in_tickets' => $tool->tickets->filter(function ($ticket) {
                    return $ticket->pivot->quantity_lost > $ticket->pivot->quantity_recovered;
                })->map(function ($ticket) {
                    return [
                        'ticket_id' => $ticket->id,
                        'ticket_title' => $ticket->title,
                        'status' => $ticket->pivot->status,
                        'keterangan' => $ticket->pivot->keterangan,
                        'quantity_lost' => $ticket->pivot->quantity_lost,
                        'quantity_recovered' => $ticket->pivot->quantity_recovered,
                    ];
                })->values(),
            ];
        });

        return response()->json($response);
    }

    /**
     * Memulihkan stok alat yang hilang dan melacak jumlahnya.
     */
    public function recoverStock(Request $request, Tool $tool)
    {
        $validated = $request->validate([
            'ticket_id' => 'required|exists:tickets,id',
            'quantity_recovered' => 'required|integer|min:1',
            'keterangan' => 'required|string|max:1000',
        ]);

        $ticket = Ticket::find($validated['ticket_id']);
        $pivot = DB::table('ticket_tool')
            ->where('ticket_id', $ticket->id)
            ->where('tool_id', $tool->id)
            ->first();

        if (!$pivot) {
            return response()->json(['message' => 'Alat ini tidak tercatat pada tiket tersebut.'], 404);
        }

        $qtyToRecover = $validated['quantity_recovered'];
        // Pastikan kolom quantity_recovered ada sebelum digunakan
        $alreadyRecovered = $pivot->quantity_recovered ?? 0;
        $remainingLost = $pivot->quantity_lost - $alreadyRecovered;

        if ($qtyToRecover > $remainingLost) {
            return response()->json(['message' => "Anda hanya bisa memulihkan maksimal {$remainingLost} item lagi."], 422);
        }

        DB::transaction(function () use ($tool, $ticket, $validated, $pivot, $qtyToRecover, $alreadyRecovered) {
            $masterBarang = MasterBarang::where('nama_barang', $tool->name)->first();
            if ($masterBarang) {
                $masterBarang->increment('stok', $qtyToRecover);
            }
            $newlyRecovered = $alreadyRecovered + $qtyToRecover;
            $newStatus = ($newlyRecovered >= $pivot->quantity_lost) ? 'dipulihkan' : 'dipulihkan sebagian';
            $newKeterangan = $pivot->keterangan . "\n\n[DIPULIHKAN " . $qtyToRecover . " item]: " . $validated['keterangan'];

            $ticket->tools()->updateExistingPivot($tool->id, [
                'status' => $newStatus,
                'keterangan' => $newKeterangan,
                'quantity_recovered' => $newlyRecovered,
            ]);
        });

        return response()->json(['message' => 'Stok berhasil dipulihkan.']);
    }

    /**
     * Fungsi CRUD Standar
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:tools,name',
            'description' => 'nullable|string',
            // 'stock' => 'required|integer|min:0',
        ]);
        $tool = Tool::create($validated);
        return response()->json($tool, 201);
    }

    public function update(Request $request, Tool $tool)
    {
        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:255|unique:tools,name,' . $tool->id,
            'description' => 'nullable|string',
            // 'stock' => 'sometimes|required|integer|min:0',
        ]);
        $tool->update($validated);
        return response()->json($tool);
    }

    public function destroy(Tool $tool)
    {
        if ($tool->tickets()->where('quantity_lost', '>', 0)->exists()) {
            return response()->json(['message' => 'Alat tidak bisa dihapus karena memiliki riwayat barang hilang.'], 422);
        }
        $tool->delete();
        return response()->json(null, 204);
    }
}
