<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Tool;
use App\Models\Ticket;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ToolController extends Controller
{
    /**
     * Menampilkan semua alat, dimuat bersama tiket terkait untuk info barang hilang.
     */
    public function index()
    {
        // Muat relasi 'tickets' beserta data pivot-nya untuk setiap alat
        return Tool::with('tickets')->latest()->get();
    }
    
    /**
     * Mengambil daftar alat yang statusnya hilang atau kembali sebagian dari semua tiket.
     */
    public function getLostItems()
    {
        // 1. Cari semua alat yang memiliki tiket dengan status 'hilang' atau 'kembali sebagian'
        $lostTools = Tool::whereHas('tickets', function ($query) {
            $query->whereIn('ticket_tool.status', ['hilang', 'kembali sebagian']);
        })
        ->with(['tickets' => function ($query) {
            // 2. Muat HANYA tiket yang relevan
            $query->whereIn('ticket_tool.status', ['hilang', 'kembali sebagian']);
        }])
        ->get();

        // 3. Ubah struktur data agar sesuai dengan yang diharapkan frontend
        $response = $lostTools->map(function ($tool) {
            return [
                'id' => $tool->id,
                'name' => $tool->name,
                'lost_in_tickets' => $tool->tickets->map(function ($ticket) {
                    return [
                        'ticket_id' => $ticket->id,
                        'ticket_title' => $ticket->title,
                        'status' => $ticket->pivot->status,
                        'keterangan' => $ticket->pivot->keterangan,
                        'quantity_lost' => $ticket->pivot->quantity_lost,
                    ];
                }),
            ];
        });

        return response()->json($response);
    }
    
    /**
     * Memulihkan stok alat yang sebelumnya hilang.
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
        
        DB::transaction(function () use ($tool, $ticket, $validated, $pivot) {
            // 1. Tambah stok alat
            $tool->increment('stock', $validated['quantity_recovered']);

            // 2. Update status & keterangan di pivot table
            // Kita gabungkan keterangan lama dengan keterangan pemulihan
            $newKeterangan = $pivot->keterangan . "\n\n[DIPULIHKAN]: " . $validated['keterangan'];
            
            $ticket->tools()->updateExistingPivot($tool->id, [
                'status' => 'dipulihkan',
                'keterangan' => $newKeterangan,
            ]);
        });

        return response()->json($tool->fresh(), 200);
    }

    // --- Fungsi CRUD Standar (Tidak Berubah) ---

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'stock' => 'required|integer|min:0',
        ]);
        $tool = Tool::create($validated);
        return response()->json($tool, 201);
    }

    public function update(Request $request, Tool $tool)
    {
        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'description' => 'nullable|string',
            'stock' => 'sometimes|required|integer|min:0',
        ]);
        $tool->update($validated);
        return response()->json($tool);
    }

    public function destroy(Tool $tool)
    {
        $tool->delete();
        return response()->json(null, 204);
    }
}