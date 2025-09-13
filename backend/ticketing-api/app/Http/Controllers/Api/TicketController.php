<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Ticket;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Carbon\Carbon;

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
        $adminId = $request->query('admin_id');
        $date = $request->query('date');
        $ticketId = $request->query('id'); // ✅ filter tiket by ID

        $query = Ticket::with(['user', 'creator']);

        // --- Jika role User (bukan admin) hanya lihat tiketnya sendiri
        if ($user->role !== 'admin') {
            $query->where('user_id', $user->id);
        } else {
            if ($search) {
                $query->whereHas('user', function ($q) use ($search) {
                    $q->where('name', 'like', '%' . $search . '%');
                });
            }
        }

        // --- Filter status
        if ($statusFilter) {
            if ($statusFilter === 'Belum Selesai') {
                $query->whereIn('status', ['Belum Dikerjakan', 'Ditunda', 'Sedang Dikerjakan']);
            } elseif (in_array($statusFilter, ['Belum Dikerjakan', 'Ditunda', 'Sedang Dikerjakan', 'Selesai', 'Ditolak'])) {
                $query->where('status', $statusFilter);
            }
        }

        // --- Filter admin tertentu
        if ($adminId) {
            $query->where('user_id', $adminId);
        }

        // --- Filter tanggal
        if ($date) {
            if ($statusFilter === 'Selesai') {
                $query->whereDate('completed_at', $date);
            } elseif ($statusFilter === 'Sedang Dikerjakan') {
                $query->whereDate('started_at', $date)
                    ->orWhereDate('updated_at', $date);
            } elseif ($statusFilter === 'Ditolak') {
                $query->whereDate('updated_at', $date);
            } else {
                $query->whereDate('created_at', $date);
            }
        }

        // --- Filter by ID (untuk klik tiket di Calendar → tampil detailnya)
        if ($ticketId) {
            $query->where('id', $ticketId);
        }

        $ticketsData = $query->latest()->paginate($perPage);
        return response()->json($ticketsData);
    }

    /**
     * Ambil semua tiket tanpa pagination (untuk Calendar).
     */
    public function allTickets()
    {
        $user = auth()->user();
        $query = Ticket::with(['user', 'creator']);

        if ($user->role !== 'admin') {
            $query->where('user_id', $user->id);
        }

        $tickets = $query->latest()->get();
        return response()->json($tickets);
    }



    private function generateKodeTiket($workshopName)
    {
        $workshopMap = [
            'Canden' => 'CN',
            'Nobo' => 'NB',
            'Bener' => 'BN',
            'Nusa Persada' => 'NP',
            'Pelita' => 'PL',
            'Muhasa' => 'MH'
        ];
        $workshopCode = $workshopMap[$workshopName] ?? 'XX';

        $now = now();
        $day = $now->format('d');
        $month = $now->format('n');

        // Menggunakan 4 digit acak untuk memastikan keunikan
        $sequence = str_pad(rand(0, 9999), 4, '0', STR_PAD_LEFT);

        return strtoupper($workshopCode . $day . $month . $sequence);
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

        $kodeTiket = $this->generateKodeTiket($validated['workshop']);

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

    public function storeFromWhatsapp(Request $request)
    {
        // 1. Validasi input dari n8n
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'workshop' => 'required|string',
            'sender_phone' => 'required|string',
            'sender_name' => 'required|string',
        ]);

        // 2. Bersihkan nomor telepon
        $cleanPhoneNumber = preg_replace('/[^0-9]/', '', $validated['sender_phone']);

        // 3. Logika "Cari atau Buat Pengguna"
        $user = User::firstOrCreate(
            ['phone' => $cleanPhoneNumber],
            [
                'name' => $validated['sender_name'],
                'email' => $cleanPhoneNumber . '@whatsapp.user',
                'password' => bcrypt(Str::random(16)),
                'role' => 'user'
            ]
        );

        // 4. Panggil helper untuk membuat kode tiket
        $kodeTiket = $this->generateKodeTiket($validated['workshop']);

        // 5. Buat tiket baru dan hubungkan dengan user yang ditemukan/dibuat
        $ticket = Ticket::create([
            'kode_tiket' => $kodeTiket,
            'title' => $validated['title'],
            'workshop' => $validated['workshop'],
            'requester_name' => $validated['sender_name'],
            'creator_id' => $user->id, // <-- Gunakan ID dari user WhatsApp
            'status' => 'Belum Dikerjakan',
        ]);

        // 6. Kembalikan data tiket yang baru dibuat agar bisa dibaca n8n
        return response()->json($ticket, 201);
    }

    public function showByCode($kode_tiket)
    {
        $ticket = Ticket::where('kode_tiket', $kode_tiket)->firstOrFail();
        return response()->json($ticket);
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

    public function myTickets(Request $request)
    {
        $user = Auth::user();

        // Pastikan hanya admin yang bisa mengakses halaman ini
        if ($user->role !== 'admin') {
            return response()->json(['error' => 'Akses ditolak.'], 403);
        }

        $perPage = $request->query('per_page', 10);

        // Query tiket di mana 'user_id' (yang mengerjakan) adalah ID admin yang login
        $ticketsData = Ticket::with(['user', 'creator'])
            ->where('user_id', $user->id)
            ->latest()
            ->paginate($perPage);

        return response()->json($ticketsData);
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
            $stats['total_users'] = User::count();

            // breakdown detail
            $stats['belum_dikerjakan'] = Ticket::where('status', 'Belum Dikerjakan')->count();
            $stats['ditunda'] = Ticket::where('status', 'Ditunda')->count();
            $stats['sedang_dikerjakan'] = Ticket::where('status', 'Sedang Dikerjakan')->count();
            $stats['selesai'] = Ticket::where('status', 'Selesai')->count();
            $stats['ditolak'] = Ticket::where('status', 'Ditolak')->count();

            // tetap support variabel lama
            $stats['completed_tickets'] = $stats['selesai'] + $stats['ditolak'];
            $stats['pending_tickets'] = $stats['belum_dikerjakan'] + $stats['ditunda'] + $stats['sedang_dikerjakan'];
        } else {
            $stats['total_tickets'] = Ticket::where('user_id', $user->id)->count();
            $stats['belum_dikerjakan'] = Ticket::where('user_id', $user->id)->where('status', 'Belum Dikerjakan')->count();
            $stats['ditunda'] = Ticket::where('user_id', $user->id)->where('status', 'Ditunda')->count();
            $stats['sedang_dikerjakan'] = Ticket::where('user_id', $user->id)->where('status', 'Sedang Dikerjakan')->count();
            $stats['selesai'] = Ticket::where('user_id', $user->id)->where('status', 'Selesai')->count();
            $stats['ditolak'] = Ticket::where('user_id', $user->id)->where('status', 'Ditolak')->count();

            $stats['completed_tickets'] = $stats['selesai'] + $stats['ditolak'];
            $stats['pending_tickets'] = $stats['belum_dikerjakan'] + $stats['ditunda'] + $stats['sedang_dikerjakan'];
        }

        return response()->json($stats);
    }



    public function submitProof(Request $request, $id)
    {
        $request->validate([
            'proof_description' => 'required|string',
            'proof_image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048', // Validasi file gambar
        ]);

        $ticket = Ticket::findOrFail($id);

        // Hanya admin yang mengerjakan yang bisa submit bukti
        if (auth()->user()->id !== $ticket->user_id) {
            return response()->json(['error' => 'Anda tidak berwenang untuk aksi ini.'], 403);
        }

        $ticket->proof_description = $request->proof_description;

        if ($request->hasFile('proof_image')) {
            // Hapus gambar lama jika ada untuk menghemat space
            if ($ticket->proof_image_path) {
                Storage::disk('public')->delete($ticket->proof_image_path);
            }
            // Simpan gambar baru dan dapatkan path-nya
            $path = $request->file('proof_image')->store('proofs', 'public');
            $ticket->proof_image_path = $path;
        }

        $ticket->save();

        return response()->json($ticket);
    }
}
