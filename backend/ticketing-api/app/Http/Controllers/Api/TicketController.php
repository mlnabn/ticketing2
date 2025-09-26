<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Ticket;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;
use Maatwebsite\Excel\Facades\Excel;
use PDF;
use App\Exports\TicketsExport;


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

        $handledStatus = $request->query('handled_status');

        $query = Ticket::with(['user', 'creator']);

        // Jika user biasa → hanya tiket miliknya
        if ($user->role !== 'admin') {
            $query->where('user_id', $user->id);
        } else {
            if ($search) {
                $query->whereHas('user', function ($q) use ($search) {
                    $q->where('name', 'like', '%' . $search . '%');
                });
            }
        }

        if ($handledStatus === 'handled') {
            $query->whereNotNull('user_id');
        }

        // Filter status
        if ($statusFilter) {
            if (is_array($statusFilter)) {
                $query->whereIn('status', $statusFilter);
            } else {
                if ($statusFilter === 'Belum Selesai') {
                    $query->whereIn('status', ['Belum Dikerjakan', 'Ditunda', 'Sedang Dikerjakan']);
                } elseif ($statusFilter === 'Selesai') {
                    $query->where('status', 'Selesai');
                } elseif ($statusFilter === 'Ditolak') {
                    $query->where('status', 'Ditolak');
                } elseif ($statusFilter === 'Sedang Dikerjakan') {
                    $query->whereIn('status', ['Sedang Dikerjakan', 'Ditunda']);
                } elseif (in_array($statusFilter, ['Belum Dikerjakan', 'Ditunda', 'Sedang Dikerjakan'])) {
                    $query->where('status', $statusFilter);
                }
            }
        }

        // Filter admin tertentu
        if ($adminId) {
            $query->where('user_id', $adminId);
        }

        // Filter tanggal
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

        // Filter ID
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

    /**
     * Generate kode tiket.
     */
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
            'kode_tiket' => $kodeTiket,
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
     * Store tiket dari WhatsApp.
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

    public function getReportAnalytics(Request $request)
    {
        // Validasi input, jika tidak ada, gunakan bulan dan tahun saat ini
        $year = $request->input('year', Carbon::now()->year);
        $month = $request->input('month', Carbon::now()->month);

        // Tentukan tanggal awal dan akhir dari bulan yang dipilih
        $startDate = Carbon::createFromDate($year, $month, 1)->startOfMonth();
        $endDate = $startDate->copy()->endOfMonth();

        // 1. Ambil jumlah tiket yang DIBUAT per hari dalam bulan yang dipilih
        $dailyCreatedCounts = Ticket::select(
            DB::raw('DATE(created_at) as date'),
            DB::raw('count(*) as count')
        )
            ->whereBetween('created_at', [$startDate, $endDate])
            ->groupBy('date')
            ->get()
            ->keyBy(fn($item) => Carbon::parse($item->date)->toDateString());

        // 2. Ambil jumlah tiket yang MULAI DIKERJAKAN per hari dalam bulan yang dipilih
        $dailyStartedCounts = Ticket::select(
            DB::raw('DATE(started_at) as date'),
            DB::raw('count(*) as count')
        )
            ->whereNotNull('user_id')
            ->whereNotNull('started_at')
            ->whereBetween('started_at', [$startDate, $endDate])
            ->groupBy('date')
            ->get()
            ->keyBy(fn($item) => Carbon::parse($item->date)->toDateString());

        $report = [];

        // 3. Iterasi untuk setiap hari di bulan yang dipilih
        for ($date = $startDate->copy(); $date->lte($endDate); $date->addDay()) {
            $dateString = $date->toDateString();

            // Ambil jumlah untuk hari ini, jika tidak ada data maka nilainya 0
            $totalForDay = $dailyCreatedCounts[$dateString]->count ?? 0;
            $workedOnForDay = $dailyStartedCounts[$dateString]->count ?? 0;

            $report[] = [
                'date' => $dateString,
                'total' => $totalForDay,      // Jumlah tiket BARU pada hari ini
                'dikerjakan' => $workedOnForDay, // Jumlah tiket MULAI DIKERJAKAN pada hari ini
            ];
        }

        return response()->json($report);
    }
    /**
     * Ambil laporan statistik tiket per admin.
     */
    public function getAdminReport(Request $request, string $adminId)
    {
        $admin = User::findOrFail($adminId);
        if ($admin->role !== 'admin') {
            return response()->json(['error' => 'Hanya admin yang bisa dilihat laporannya.'], 403);
        }

        // --- QUERY UNTUK STATISTIK KESELURUHAN (TIDAK BERUBAH) ---
        $allTicketsQuery = Ticket::where('user_id', $adminId);
        $totalTickets = $allTicketsQuery->count();
        $completedTickets = (clone $allTicketsQuery)->where('status', 'Selesai')->count();
        $rejectedTickets = (clone $allTicketsQuery)->where('status', 'Ditolak')->count();
        $inProgressTickets = (clone $allTicketsQuery)
            ->whereIn('status', ['Belum Dikerjakan', 'Ditunda', 'Sedang Dikerjakan'])
            ->count();

        // --- (DIUBAH) QUERY UNTUK DATA TABEL DENGAN PAGINASI DAN FILTER ---
        $paginatedQuery = Ticket::with(['user', 'creator'])->where('user_id', $adminId);

        // Tambahkan logika untuk menangani filter status dari request
        if ($request->has('status')) {
            $status = $request->query('status');
            if ($status === 'completed') {
                $paginatedQuery->where('status', 'Selesai');
            } elseif ($status === 'rejected') {
                $paginatedQuery->where('status', 'Ditolak');
            } elseif ($status === 'in_progress') {
                $paginatedQuery->whereIn('status', ['Belum Dikerjakan', 'Ditunda', 'Sedang Dikerjakan']);
            }
            // Jika status 'all', tidak perlu filter tambahan
        }

        $perPage = $request->query('per_page', 10);
        $paginatedTickets = $paginatedQuery->latest()->paginate($perPage);

        return response()->json([
            'total' => $totalTickets,
            'completed' => $completedTickets,
            'rejected' => $rejectedTickets,
            'in_progress' => $inProgressTickets,
            'tickets' => $paginatedTickets, // Kirim hasil paginasi yang sudah difilter
        ]);
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
     * Menampilkan tiket milik admin yang login.
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
        $ticket->completed_at = now();
        $ticket->save();

        return response()->json($ticket->load(['user', 'creator']));
    }

    /**
     * Ambil tiket yang dibuat oleh user login.
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
    /**
     * Update status tiket.
     */
    public function updateStatus(Request $request, Ticket $ticket)
    {
        $user = auth()->user();

        // --- [LOGIKA BARU] Otorisasi Kepemilikan Tiket ---
        // 1. Pastikan yang mengubah adalah admin.
        if ($user->role !== 'admin') {
            return response()->json(['error' => 'Hanya admin yang bisa mengubah status.'], 403);
        }

        // 2. Jika tiket sudah ada penanggung jawabnya, pastikan hanya dia yang bisa mengubah.
        if ($ticket->user_id && $ticket->user_id !== $user->id) {
            return response()->json(['error' => 'Anda tidak berhak mengubah status tiket yang sedang dikerjakan oleh admin lain.'], 403);
        }
        // --- Akhir Logika Baru ---

        $validated = $request->validate(['status' => 'required|string']);
        $updateData = ['status' => $validated['status']];

        if ($validated['status'] === 'Sedang Dikerjakan' && is_null($ticket->started_at)) {
            $updateData['started_at'] = now();
            // Jika tiket belum ada penanggung jawab, otomatis tugaskan ke admin yang menekan tombol.
            if (is_null($ticket->user_id)) {
                $updateData['user_id'] = $user->id;
            }
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
            $stats['sedang_dikerjakan'] = Ticket::where('status', 'Sedang Dikerjakan')->count();
            $stats['selesai']          = Ticket::where('status', 'Selesai')->count();
            $stats['ditolak']          = Ticket::where('status', 'Ditolak')->count();

            $stats['completed_tickets'] = $stats['selesai'];
            $stats['rejected_tickets']  = $stats['ditolak'];
            $stats['pending_tickets']   = $stats['belum_dikerjakan'] + $stats['ditunda'] + $stats['sedang_dikerjakan'];
        } else {
            $stats['total_tickets']    = Ticket::where('user_id', $user->id)->count();
            $stats['belum_dikerjakan'] = Ticket::where('user_id', $user->id)->where('status', 'Belum Dikerjakan')->count();
            $stats['ditunda']          = Ticket::where('user_id', $user->id)->where('status', 'Ditunda')->count();
            $stats['sedang_dikerjakan'] = Ticket::where('user_id', $user->id)->where('status', 'Sedang Dikerjakan')->count();
            $stats['selesai']          = Ticket::where('user_id', $user->id)->where('status', 'Selesai')->count();
            $stats['ditolak']          = Ticket::where('user_id', $user->id)->where('status', 'Ditolak')->count();

            $stats['completed_tickets'] = $stats['selesai'];
            $stats['rejected_tickets']  = $stats['ditolak'];
            $stats['pending_tickets']   = $stats['belum_dikerjakan'] + $stats['ditunda'] + $stats['sedang_dikerjakan'];
        }

        return response()->json($stats);
    }

    /**
     * Submit bukti penyelesaian tiket.
     */
    public function submitProof(Request $request, $id)
    {
        $request->validate([
            'proof_description' => 'required|string',
            'proof_image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
        ]);

        $ticket = Ticket::findOrFail($id);

        if (auth()->user()->id !== $ticket->user_id) {
            return response()->json(['error' => 'Anda tidak berwenang untuk aksi ini.'], 403);
        }

        $ticket->proof_description = $request->proof_description;

        if ($request->hasFile('proof_image')) {
            if ($ticket->proof_image_path) {
                Storage::disk('public')->delete($ticket->proof_image_path);
            }
            $path = $request->file('proof_image')->store('proofs', 'public');
            $ticket->proof_image_path = $path;
        }

        $ticket->save();

        return response()->json($ticket);
    }

    public function reportStats()
    {
        $total = Ticket::count();
        $handled = Ticket::whereNotNull('user_id')->count();
        $completed = Ticket::where('status', 'Selesai')->count();
        $rejected = Ticket::where('status', 'Ditolak')->count();

        // Tiket yang sedang dalam progres (sudah ditangani tapi belum selesai/ditolak)
        $in_progress = Ticket::whereNotNull('user_id')
            ->whereNotIn('status', ['Selesai', 'Ditolak'])
            ->count();

        return response()->json([
            'total' => $total,
            'handled' => $handled,
            'completed' => $completed,
            'rejected' => $rejected,
            'in_progress' => $in_progress,
        ]);
    }
    public function export(Request $request)
    {
        // 1. Validasi tipe ekspor
        $validated = $request->validate([
            'type' => 'required|in:pdf,excel',
            // Tambahkan validasi untuk filter lain jika perlu
            'status' => 'nullable|string',
            'admin_id' => 'nullable|exists:users,id',
            'handled_status' => 'nullable|string',
        ]);

        // 2. Gunakan logika query yang sama dengan method index()
        // Ini penting agar data yang diekspor sama dengan yang ditampilkan
        $query = Ticket::with(['user', 'creator']);

        // Filter dari ComprehensiveReportPage.js
        if ($request->handled_status === 'handled') {
            $query->whereNotNull('user_id');
        }

        if ($request->status) {
            $statusFilter = $request->status;
            if ($statusFilter === 'Selesai' || $statusFilter === 'Ditolak') {
                $query->where('status', $statusFilter);
            } elseif ($statusFilter === 'in_progress') {
                // asumsi dari frontend: in_progress = 'Sedang Dikerjakan' atau 'Ditunda'
                $query->whereIn('status', ['Sedang Dikerjakan', 'Ditunda']);
            }
        }

        // Filter dari TicketReportDetail.js
        if ($request->admin_id) {
            $query->where('user_id', $request->admin_id);
            // Jika ada filter status tambahan dari detail admin
            if ($request->status && $request->status !== 'all') {
                if ($request->status === 'completed') {
                    $query->where('status', 'Selesai');
                } elseif ($request->status === 'rejected') {
                    $query->where('status', 'Ditolak');
                } elseif ($request->status === 'in_progress') {
                    $query->whereIn('status', ['Belum Dikerjakan', 'Ditunda', 'Sedang Dikerjakan']);
                }
            }
        }

        // 3. Ambil semua data (tanpa paginasi)
        $tickets = $query->latest()->get();

        // 4. Generate file berdasarkan tipe
        $fileName = 'laporan-tiket-' . date('Y-m-d_H-i-s');

        if ($validated['type'] === 'excel') {
            return Excel::download(new TicketsExport($tickets), $fileName . '.xlsx');
        }

        if ($validated['type'] === 'pdf') {
            $title = 'Laporan Tiket';
            if ($request->admin_id) {
                $admin = User::find($request->admin_id);
                $title = 'Laporan Penyelesaian - ' . ($admin->name ?? 'Admin');
            }

            $pdf = PDF::loadView('reports.tickets_pdf', [
                'tickets' => $tickets,
                'title' => $title
            ]);

            // Untuk orientasi landscape jika kolomnya banyak
            $pdf->setPaper('a4', 'landscape');

            return $pdf->stream($fileName . '.pdf');
        }
    }
}
