<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Ticket;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

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
        $ticketId = $request->query('id');

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
            if (is_array($statusFilter)) {
                $query->whereIn('status', $statusFilter);
            } else {
                if ($statusFilter === 'Belum Selesai') {
                    $query->whereIn('status', ['Belum Dikerjakan', 'Ditunda', 'Sedang Dikerjakan']);
                } elseif ($statusFilter === 'Selesai') {
                    $query->where('status', 'Selesai'); // ✅ hanya selesai
                } elseif ($statusFilter === 'Ditolak') {
                    $query->where('status', 'Ditolak'); // ✅ dipisahkan
                } elseif ($statusFilter === 'Sedang Dikerjakan') {
                    $query->whereIn('status', ['Sedang Dikerjakan', 'Ditunda']);
                } elseif (in_array($statusFilter, ['Belum Dikerjakan', 'Ditunda', 'Sedang Dikerjakan'])) {
                    $query->where('status', $statusFilter);
                }
            }
        }

        // --- Filter admin tertentu
        if ($adminId) {
            $query->where('user_id', $adminId);
        }

        // --- Filter tanggal
        if ($date) {
            if ($statusFilter === 'Selesai' || $statusFilter === 'Ditolak') {
                $query->whereDate('completed_at', $date);
            } elseif ($statusFilter === 'Sedang Dikerjakan') {
                $query->where(function ($q) use ($date) {
                    $q->whereDate('started_at', $date)
                      ->orWhereDate('updated_at', $date);
                });
            } else {
                $query->whereDate('created_at', $date);
            }
        }

        // --- Filter by ID
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

        $sequence = str_pad(rand(0, 9999), 4, '0', STR_PAD_LEFT);

        return strtoupper($workshopCode . $day . $month . $sequence);
    }

    /**
     * Simpan tiket baru.
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
            'user_id' => null,
            'status' => 'Belum Dikerjakan',
        ]);

        return response()->json($ticket, 201);
    }

    /**
     * Store dari WhatsApp
     */
    public function storeFromWhatsapp(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'workshop' => 'required|string',
            'sender_phone' => 'required|string',
            'sender_name' => 'required|string',
        ]);

        $cleanPhoneNumber = preg_replace('/[^0-9]/', '', $validated['sender_phone']);

        $user = User::firstOrCreate(
            ['phone' => $cleanPhoneNumber],
            [
                'name' => $validated['sender_name'],
                'email' => $cleanPhoneNumber . '@whatsapp.user',
                'password' => bcrypt(Str::random(16)),
                'role' => 'user'
            ]
        );

        $kodeTiket = $this->generateKodeTiket($validated['workshop']);

        $ticket = Ticket::create([
            'kode_tiket' => $kodeTiket,
            'title' => $validated['title'],
            'workshop' => $validated['workshop'],
            'requester_name' => $validated['sender_name'],
            'creator_id' => $user->id,
            'status' => 'Belum Dikerjakan',
        ]);

        return response()->json($ticket, 201);
    }

    public function showByCode($kode_tiket)
    {
        $ticket = Ticket::where('kode_tiket', $kode_tiket)->firstOrFail();
        return response()->json($ticket);
    }

    /**
     * Menugaskan tiket ke admin.
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

    /**
     * Menampilkan tiket milik admin yang login
     */
    public function myTickets(Request $request)
    {
        $user = Auth::user();

        if ($user->role !== 'admin') {
            return response()->json(['error' => 'Akses ditolak.'], 403);
        }

        $perPage = $request->query('per_page', 10);

        $ticketsData = Ticket::with(['user', 'creator'])
            ->where('user_id', $user->id)
            ->latest()
            ->paginate($perPage);

        return response()->json($ticketsData);
    }

    /**
     * Menolak tiket.
     */
    public function reject(Request $request, Ticket $ticket)
    {
        if (auth()->user()->role !== 'admin') {
            return response()->json(['error' => 'Hanya admin yang bisa menolak tiket.'], 403);
        }

        $validated = $request->validate([
            'reason' => 'required|string|max:1000',
        ]);

        $ticket->status = 'Ditolak';
        $ticket->rejection_reason = $validated['reason'];
        $ticket->completed_at = now(); // ✅ supaya terhitung selesai proses
        $ticket->save();

        return response()->json($ticket->load(['user', 'creator']));
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
        } elseif ($validated['status'] === 'Ditolak') {
            $updateData['completed_at'] = now();
        }

        $ticket->update($updateData);
        return response()->json($ticket->load(['user', 'creator']));
    }

    /**
     * Statistik tiket.
     */
    public function stats()
    {
        $user = Auth::user();
        $stats = [];

        if ($user->role === 'admin') {
            $stats['total_tickets']    = Ticket::count();
            $stats['total_users']      = User::count();

            $stats['belum_dikerjakan'] = Ticket::where('status', 'Belum Dikerjakan')->count();
            $stats['ditunda']          = Ticket::where('status', 'Ditunda')->count();
            $stats['sedang_dikerjakan']= Ticket::where('status', 'Sedang Dikerjakan')->count();
            $stats['selesai']          = Ticket::where('status', 'Selesai')->count();
            $stats['ditolak']          = Ticket::where('status', 'Ditolak')->count();

            // Agregat
            $stats['completed_tickets'] = $stats['selesai']; // ✅ hanya selesai
            $stats['rejected_tickets']  = $stats['ditolak']; // ✅ dipisahkan
            $stats['pending_tickets']   = $stats['belum_dikerjakan'] + $stats['ditunda'] + $stats['sedang_dikerjakan'];
        } else {
            $stats['total_tickets']    = Ticket::where('user_id', $user->id)->count();
            $stats['belum_dikerjakan'] = Ticket::where('user_id', $user->id)->where('status', 'Belum Dikerjakan')->count();
            $stats['ditunda']          = Ticket::where('user_id', $user->id)->where('status', 'Ditunda')->count();
            $stats['sedang_dikerjakan']= Ticket::where('user_id', $user->id)->where('status', 'Sedang Dikerjakan')->count();
            $stats['selesai']          = Ticket::where('user_id', $user->id)->where('status', 'Selesai')->count();
            $stats['ditolak']          = Ticket::where('user_id', $user->id)->where('status', 'Ditolak')->count();

            $stats['completed_tickets'] = $stats['selesai'];
            $stats['rejected_tickets']  = $stats['ditolak'];
            $stats['pending_tickets']   = $stats['belum_dikerjakan'] + $stats['ditunda'] + $stats['sedang_dikerjakan'];
        }

        return response()->json($stats);
    }
}
