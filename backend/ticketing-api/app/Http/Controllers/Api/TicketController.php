<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Ticket;
use Illuminate\Http\Request;

class TicketController extends Controller
{
    /**
     * Ambil semua tiket beserta data user (sebagai pengganti worker).
     */
    public function index()
    {
        return Ticket::with('user')->latest()->get();
    }

    /**
     * Simpan tiket baru dengan validasi user_id.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'user_id' => 'required|exists:users,id', // ganti dari workers
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
