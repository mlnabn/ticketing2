<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Ticket;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class TicketController extends Controller
{
    /**
     * Ambil tiket berdasarkan peran pengguna.
     */
    public function index(Request $request)
    {
        $user = auth()->user();
        $perPage = $request->query('per_page', 10);
        $search = $request->query('search');
        $statusFilter = $request->query('status');

        $query = Ticket::with(['user', 'creator']);

        if ($user->role === 'admin') {
            if ($search) {
                $query->whereHas('user', function ($q) use ($search) {
                    $q->where('name', 'like', '%' . $search . '%');
                });
            }
        } else {
            $query->where('user_id', $user->id);
        }

        if ($statusFilter) {
            if ($statusFilter === 'Belum Selesai') {
                $query->whereIn('status', ['Belum Dikerjakan', 'Ditunda', 'Sedang Dikerjakan']);
            } else {
                $query->where('status', $statusFilter);
            }
        }

        $ticketsData = $query->latest()->paginate($perPage);
        return response()->json($ticketsData);
    }

    /**
     * PERUBAHAN: Simpan tiket baru dengan user_id null.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'workshop' => 'required|string',
            'requested_time' => 'nullable|date_format:H:i',
            'requested_date' => 'nullable|date',
        ]);

        $ticket = Ticket::create([
            'title' => $validated['title'],
            'workshop' => $validated['workshop'],
            'requested_time' => $validated['requested_time'] ?? null,
            'requested_date' => $validated['requested_date'] ?? null,
            'creator_id' => auth()->id(),
            'user_id' => null, // Tiket baru belum ditugaskan
            'status' => 'Belum Dikerjakan',
        ]);

        return response()->json($ticket, 201);
    }

    /**
     * FUNGSI BARU: Menugaskan tiket ke admin dan memulai pekerjaan.
     */
    public function assign(Request $request, Ticket $ticket)
    {
        if (auth()->user()->role !== 'admin') {
            return response()->json(['error' => 'Hanya admin yang bisa menugaskan tiket.'], 403);
        }

        $validated = $request->validate([
            'user_id' => 'required|exists:users,id',
        ]);
        
        $assignee = User::find($validated['user_id']);
        if (!$assignee || $assignee->role !== 'admin') {
            return response()->json(['error' => 'Hanya bisa menugaskan ke sesama admin.'], 422);
        }

        $ticket->update([
            'user_id' => $validated['user_id'],
            'status' => 'Sedang Dikerjakan',
            'started_at' => now(),
        ]);

        return response()->json($ticket->load(['user', 'creator']));
    }

    public function reject(Request $request, Ticket $ticket)
    {
        if (auth()->user()->role !== 'admin') {
            return response()->json(['error' => 'Hanya admin yang bisa menolak tiket.'], 403);
        }

        $validated = $request->validate([
            'reason' => 'required|string|max:1000',
        ]);

        // PERBAIKAN: Menyimpan data secara manual untuk menghindari masalah
        $ticket->status = 'Ditolak';
        $ticket->rejection_reason = $validated['reason'];
        $ticket->save(); // Simpan perubahan

        return response()->json($ticket->load(['user', 'creator']));
    }
    /**
     * Ambil tiket yang dibuat oleh pengguna yang sedang login.
     */
    public function createdTickets(Request $request)
    {
        $tickets = Ticket::with(['user', 'creator'])
            ->where('creator_id', auth()->id())
            ->latest()
            ->paginate(5);

        return response()->json($tickets);
    }

    /**
     * Hapus beberapa tiket sekaligus (hanya admin).
     */
    public function bulkDelete(Request $request)
    {
        if (auth()->user()->role !== 'admin') {
            return response()->json(['error' => 'Akses ditolak.'], 403);
        }

        $validated = $request->validate([
            'ids' => 'required|array|min:1',
            'ids.*' => 'exists:tickets,id',
        ]);

        Ticket::whereIn('id', $validated['ids'])->delete();
        return response()->json(['message' => 'Tiket yang dipilih telah dihapus.']);
    }

    /**
     * Hapus satu tiket.
     */
    public function destroy(Ticket $ticket)
    {
        $user = auth()->user();
        $isAdmin = $user->role === 'admin';
        $isCreator = $user->id === $ticket->creator_id;
        $isAssigneeOfCompletedTicket = ($user->id === $ticket->user_id && $ticket->status === 'Selesai');

        if ($isAdmin || $isCreator || $isAssigneeOfCompletedTicket) {
            $ticket->delete();
            return response()->json(null, 204);
        }

        return response()->json(['error' => 'Anda tidak memiliki izin untuk menghapus tiket ini.'], 403);
    }

    /**
     * Update status tiket.
     */
    public function updateStatus(Request $request, Ticket $ticket)
    {
        $validated = $request->validate(['status' => 'required|string']);
        $updateData = ['status' => $validated['status']];

        if ($validated['status'] === 'Sedang Dikerjakan' && is_null($ticket->started_at)) {
            $updateData['started_at'] = now();
        } elseif ($validated['status'] === 'Selesai') {
            $updateData['completed_at'] = now();
        }

        $ticket->update($updateData);
        return response()->json($ticket->load(['user', 'creator']));
    }
    
    /**
     * Ambil statistik tiket.
     */
    public function stats()
    {
        $user = Auth::user();
        $stats = [];

        if ($user->role === 'admin') {
            $stats['total_tickets'] = Ticket::count();
            $stats['completed_tickets'] = Ticket::where('status', 'Selesai')->count();
            $stats['pending_tickets'] = $stats['total_tickets'] - $stats['completed_tickets'];
            $stats['total_users'] = User::count();
        } else {
            $stats['total_tickets'] = Ticket::where('user_id', $user->id)->count();
            $stats['completed_tickets'] = Ticket::where('user_id', $user->id)->where('status', 'Selesai')->count();
            $stats['pending_tickets'] = $stats['total_tickets'] - $stats['completed_tickets'];
        }

        return response()->json($stats);
    }
}
