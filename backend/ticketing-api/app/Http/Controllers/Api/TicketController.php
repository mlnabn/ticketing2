<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Ticket;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth; // <-- 1. Tambahkan ini

class TicketController extends Controller
{
    /**
     * Ambil tiket berdasarkan peran pengguna.
     * - Admin: Dapat melihat semua tiket.
     * - User: Hanya dapat melihat tiket yang ditugaskan padanya.
     */
    public function index(Request $request)
    {
        // 1. Ambil data user dan parameter dari request
        $user = Auth::user();
        $perPage = $request->query('per_page', 5);
        $search = $request->query('search');

        // 2. Mulai query dasar dengan menyertakan relasi user
        $query = Ticket::with(['user', 'creator']);

        // 3. Terapkan filter berdasarkan peran
        if ($user->role === 'admin') {
            // Jika admin dan ada parameter pencarian, terapkan filter 'whereHas'
            if ($search) {
                $query->whereHas('user', function ($q) use ($search) {
                    $q->where('name', 'like', '%' . $search . '%');
                });
            }
        } else {
            // Jika bukan admin, filter hanya untuk tiket miliknya sendiri
            $query->where('user_id', $user->id);
        }

        // 4. Setelah semua filter diterapkan, baru lakukan pengurutan dan paginasi
        $tickets = $query->latest()->paginate($perPage);

        // 5. Kembalikan hasil dalam format JSON
        return response()->json($tickets);
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
            'workshop' => 'required|string',
        ]);

        $validated['creator_id'] = auth()->id();
        $ticket = Ticket::create($validated);
        return response()->json($ticket->load('user'), 201);
    }

    public function createdTickets(Request $request)
    {
        $tickets = Ticket::with(['user', 'creator']) // 'user' di sini adalah orang yang DITUGASKAN
            ->where('creator_id', auth()->id())
            ->latest()
            ->paginate(5); // Kita pakai paginasi 5 agar tidak terlalu panjang

        return response()->json($tickets);
    }

    public function bulkDelete(Request $request)
    {
        // Pastikan hanya admin yang bisa mengakses
        if (auth()->user()->role !== 'admin') {
            return response()->json(['error' => 'Akses ditolak.'], 403);
        }

        // Validasi input: harus berupa array dan tidak boleh kosong
        $validated = $request->validate([
            'ids' => 'required|array|min:1',
            'ids.*' => 'exists:tickets,id', // Pastikan setiap ID ada di tabel tiket
        ]);

        // Hapus semua tiket yang ID-nya ada di dalam array
        Ticket::whereIn('id', $validated['ids'])->delete();

        // Kembalikan respons berhasil
        return response()->json(['message' => 'Tiket yang dipilih telah dihapus.']);
    }

    /**
     * Hapus tiket.
     */
    public function destroy(Ticket $ticket)
    {
        // Ambil data pengguna yang sedang login
        $user = auth()->user();

        // Definisikan kondisi siapa saja yang boleh menghapus
        $isAdmin = $user->role === 'admin';
        $isCreator = $user->id === $ticket->creator_id;
        $isAssigneeOfCompletedTicket = ($user->id === $ticket->user_id && $ticket->status === 'Selesai');

        // Jika pengguna memenuhi SALAH SATU dari kondisi di atas, izinkan penghapusan
        if ($isAdmin || $isCreator || $isAssigneeOfCompletedTicket) {
            $ticket->delete();
            return response()->json(null, 204); // 204 No Content, artinya berhasil
        }

        // Jika tidak ada kondisi yang terpenuhi, tolak akses
        return response()->json(['error' => 'Anda tidak memiliki izin untuk menghapus tiket ini.'], 403); // 403 Forbidden
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

    public function stats()
    {
        $user = Auth::user();
        $stats = [];

        if ($user->role === 'admin') {
            // Statistik untuk Admin (mencakup semua tiket dan user)
            $stats['total_tickets'] = Ticket::count();
            $stats['completed_tickets'] = Ticket::where('status', 'Selesai')->count();
            $stats['pending_tickets'] = $stats['total_tickets'] - $stats['completed_tickets'];
            $stats['total_users'] = User::count();
        } else {
            // Statistik untuk User biasa (hanya tiket miliknya)
            $stats['total_tickets'] = Ticket::where('user_id', $user->id)->count();
            $stats['completed_tickets'] = Ticket::where('user_id', $user->id)->where('status', 'Selesai')->count();
            $stats['pending_tickets'] = $stats['total_tickets'] - $stats['completed_tickets'];
        }

        return response()->json($stats);
    }
}