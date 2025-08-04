<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Ticket; // Pastikan ini mengarah ke Ticket
use Illuminate\Http\Request;

class TicketController extends Controller
{
    /**
     * Bagian ini yang mengambil data untuk ditampilkan di tabel.
     * Pastikan ia menggunakan 'Ticket' Model.
     */
    public function index()
    {
        return Ticket::with('worker')->latest()->get();
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'worker_id' => 'required|exists:workers,id',
            'status' => 'required|string',
        ]);
        $ticket = Ticket::create($validated);
        return response()->json($ticket->load('worker'), 201);
    }

    public function destroy(Ticket $ticket)
    {
        $ticket->delete();
        return response()->json(null, 204);
    }

    public function updateStatus(Request $request, Ticket $ticket)
    {
        $validated = $request->validate(['status' => 'required|string']);
        $ticket->update($validated);
        return response()->json($ticket->load('worker'));
    }
}