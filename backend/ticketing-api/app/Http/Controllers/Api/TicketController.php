<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Ticket;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth; // <-- 1. Tambahkan ini

class TicketController extends Controller
{
    /**
     * Ambil tiket berdasarkan peran pengguna.
     * - Admin: Dapat melihat semua tiket.
     * - User: Hanya dapat melihat tiket yang ditugaskan padanya.
     */
    public function index()
    {
        // 2. Ambil data user yang sedang login
        $user = Auth::user();

        // 3. Tambahkan logika berdasarkan peran (role)
        if ($user->role === 'admin') {
            // Jika admin, kembalikan semua tiket
            return Ticket::with('user')->latest()->get();
        } else {
            // Jika bukan admin (yaitu 'user'), filter berdasarkan user_id
            return Ticket::with('user')
                        ->where('user_id', $user->id) // Ini adalah baris kuncinya
                        ->latest()
                        ->get();
        }
    }

    /**
     * Simpan tiket baru dengan validasi user_id.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'user_id' => 'required|exists:users,id',
            'status' => 'required|string',
        ]);

        $ticket = Ticket::create($validated);
        return response()->json($ticket->load('user'), 201);
    }

    /**
     * Hapus tiket.
     */
    public function destroy(Ticket $ticket)
    {
        $ticket->delete();
        return response()->json(null, 204);
    }

    /**
     * Update status tiket.
     */
    public function updateStatus(Request $request, Ticket $ticket)
    {
        $validated = $request->validate(['status' => 'required|string']);
        $ticket->update($validated);
        return response()->json($ticket->load('user'));
    }
}