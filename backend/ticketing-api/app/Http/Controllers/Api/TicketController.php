<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Ticket;
use App\Models\User;
use App\Models\Workshop;
use Illuminate\Http\Request;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;
use Illuminate\Support\Facades\Cache;
use Maatwebsite\Excel\Facades\Excel;
use Barryvdh\DomPDF\Facade\Pdf;
use App\Exports\TicketsExport;
use App\Models\StokBarang;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Http;
use Illuminate\Http\Client\RequestException;
use Illuminate\Http\Client\ConnectionException;


class TicketController extends Controller
{

    protected function applyFilters(Builder $query, Request $request): Builder
    {
        $search = $request->query('search');
        $statusFilter = $request->query('status');
        $adminId = $request->query('admin_id');
        $date = $request->query('date');
        $ticketId = $request->query('id');
        $handledStatus = $request->query('handled_status');
        $year = $request->query('year');
        $month = $request->query('month');
        $startDate = $request->query('start_date');
        $endDate = $request->query('end_date');

        if ($search) {
            $query->where(function (Builder $q) use ($search) {
                $q->where('kode_tiket', 'like', '%' . $search . '%')
                    ->orWhere('title', 'like', '%' . $search . '%');

                $q->orWhereHas('user', function (Builder $userQuery) use ($search) {
                    $userQuery->where('name', 'like', '%' . $search . '%');
                });

                $q->orWhereHas('creator', function (Builder $creatorQuery) use ($search) {
                    $creatorQuery->where('name', 'like', '%' . $search . '%');
                });

                $q->orWhereHas('workshop', function (Builder $workshopQuery) use ($search) {
                    $workshopQuery->where('name', 'like', '%' . $search . '%');
                });
            });
        }

        if ($handledStatus === 'handled') {
            $query->whereNotNull('user_id');
        }

        if ($statusFilter) {
            if (is_array($statusFilter)) {
                $query->whereIn('status', $statusFilter);
            } else {
                $statusMap = [
                    'Belum Selesai'     => ['Belum Dikerjakan', 'Ditunda', 'Sedang Dikerjakan'],
                    'Sedang Dikerjakan' => ['Sedang Dikerjakan', 'Ditunda'],
                    'in_progress'       => ['Sedang Dikerjakan', 'Ditunda'],
                    'completed'         => ['Selesai'],
                    'rejected'          => ['Ditolak'],
                ];

                if (isset($statusMap[$statusFilter])) {
                    $query->whereIn('status', $statusMap[$statusFilter]);
                } else {
                    $query->where('status', $statusFilter);
                }
            }
        }

        if ($adminId) {
            $query->where('user_id', $adminId);
        }
        if ($date) {
            $query->whereDate('created_at', $date);
        }
        if ($ticketId) {
            $query->where('id', $ticketId);
        }
        if ($startDate && $endDate) {
            $query->whereBetween('created_at', [$startDate . ' 00:00:00', $endDate . ' 23:59:59']);
        } else {
            if ($year) {
                $query->whereYear('created_at', $year);
            }
            if ($month) {
                $query->whereMonth('created_at', $month);
            }
        }

        return $query;
    }

    /**
     * Ambil tiket berdasarkan peran pengguna dan mengurutkan tiket berdasarkan urgensi dan tanggal pembuatan.
     */
    public function index(Request $request)
    {
        $user = Auth::user();
        $perPage = $request->query('per_page', 15);

        $query = Ticket::with(['user', 'creator', 'masterBarangs', 'workshop']);

        if ($user->role !== 'admin') {
            $query->where('creator_id', $user->id);
        }

        $query = $this->applyFilters($query, $request);
        $query->orderByRaw("CASE
                                WHEN is_urgent = 1 AND status = 'Belum Dikerjakan' THEN 0
                                WHEN is_urgent = 1 AND status IN ('Sedang Dikerjakan', 'Ditunda') THEN 1
                                WHEN (is_urgent = 0 OR is_urgent IS NULL) AND status = 'Belum Dikerjakan' THEN 2
                                WHEN (is_urgent = 0 OR is_urgent IS NULL) AND status IN ('Sedang Dikerjakan', 'Ditunda') THEN 3
                                ELSE 4
                             END ASC");
        $query->orderBy('updated_at', 'DESC');
        if ($request->boolean('all')) {
            $ticketsResult = $query->get();
            return response()->json($ticketsResult);
        } else {
            $ticketsData = $query->paginate($perPage);
            return response()->json($ticketsData);
        }
    }

    /**
     * Ambil semua tiket tanpa pagination (untuk Calendar).
     */
    public function allTickets()
    {
        $user = Auth::user();
        $query = Ticket::with(['user', 'creator', 'workshop']);

        if ($user->role !== 'admin') {
            $query->where('user_id', $user->id);
        }

        $tickets = $query->latest()->get();
        return response()->json($tickets);
    }

    /**
     * Generate kode tiket.
     */
    private function generateKodeTiket($workshopId)
    {
        $workshop = Workshop::find($workshopId);
        $workshopCode = $workshop ? $workshop->code : 'XX';

        $now = now();
        $prefix = strtoupper($workshopCode . $now->format('dn'));

        $lastTicket = Ticket::where('kode_tiket', 'like', $prefix . '%')
            ->orderBy('id', 'desc')
            ->first();

        $nextSequence = 1;

        if ($lastTicket) {
            $lastSequencePart = substr($lastTicket->kode_tiket, strlen($prefix));
            $lastSequenceNumber = (int)$lastSequencePart;
            $nextSequence = $lastSequenceNumber + 1;
        }

        $sequence = str_pad($nextSequence, 4, '0', STR_PAD_LEFT);

        return $prefix . $sequence;
    }

    /**
     * Simpan tiket baru.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'workshop_id' => 'required|exists:workshops,id',
            'requested_time' => 'nullable|date_format:H:i',
            'requested_date' => 'nullable|date',
        ]);

        $kodeTiket = $this->generateKodeTiket($validated['workshop_id']);
        $isUrgent = $this->classifyUrgencyWithAI($validated['title']);

        $ticket = Ticket::create([
            'kode_tiket' => $kodeTiket,
            'title' => $validated['title'],
            'workshop_id' => $validated['workshop_id'],
            'requested_time' => $validated['requested_time'] ?? null,
            'requested_date' => $validated['requested_date'] ?? null,
            'creator_id' => auth()->id(),
            'user_id' => null,
            'status' => 'Belum Dikerjakan',
            'is_urgent' => $isUrgent,
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
            'workshop_name' => 'required|string|exists:workshops,name',
            'sender_phone' => 'required|string',
            'sender_name' => 'required|string',
        ]);
        $workshop = Workshop::where('name', $validated['workshop_name'])->first();
        if (!$workshop) {
            return response()->json(['error' => 'Workshop tidak valid.'], 422);
        }

        $phoneParts = preg_split('/[,\s]+/', $validated['sender_phone']);
        $firstPhoneNumber = $phoneParts[0];
        $cleanPhoneNumber = preg_replace('/[^0-9]/', '', $firstPhoneNumber);

        $lockKey = 'creating-user-lock-' . $cleanPhoneNumber;
        $lock = Cache::lock($lockKey, 10);

        try {
            if ($lock->get()) {
                $user = User::firstOrCreate(
                    ['phone' => $cleanPhoneNumber],
                    [
                        'name' => $validated['sender_name'],
                        'email' => $cleanPhoneNumber . '@whatsapp.user',
                        'password' => bcrypt(Str::random(16)),
                        'role' => 'user'
                    ]
                );
                $lock->release();
            } else {
                sleep(1);
                $user = User::where('phone', $cleanPhoneNumber)->firstOrFail();
            }
        } catch (\Exception $e) {
            if ($lock && $lock->isOwned()) {
                $lock->release();
            }
            return response()->json(['error' => 'Gagal memproses user: ' . $e->getMessage()], 500);
        }

        $isUrgent = $this->classifyUrgencyWithAI($validated['title']);
        $kodeTiket = $this->generateKodeTiket($workshop->id);

        $ticket = Ticket::create([
            'kode_tiket' => $kodeTiket,
            'title' => $validated['title'],
            'workshop_id' => $workshop->id,
            'requester_name' => $validated['sender_name'],
            'creator_id' => $user->id,
            'status' => 'Belum Dikerjakan',
            'is_urgent' => $isUrgent,
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
        $year = $request->input('year', Carbon::now()->year);
        $month = $request->input('month');

        if (!$month) {
            $monthlyCreated = Ticket::select(
                DB::raw('MONTH(created_at) as month'),
                DB::raw('count(*) as count')
            )
                ->whereYear('created_at', $year)
                ->groupBy('month')
                ->get()->pluck('count', 'month');

            $monthlyStarted = Ticket::select(
                DB::raw('MONTH(started_at) as month'),
                DB::raw('count(*) as count')
            )
                ->whereYear('started_at', $year)
                ->whereNotNull('user_id')
                ->whereNotNull('started_at')
                ->groupBy('month')
                ->get()->pluck('count', 'month');

            $report = [];
            for ($m = 1; $m <= 12; $m++) {
                $report[] = [
                    'month' => Carbon::create()->month($m)->format('M'),
                    'total' => $monthlyCreated[$m] ?? 0,
                    'dikerjakan' => $monthlyStarted[$m] ?? 0,
                ];
            }
            return response()->json($report);
        }

        $dailyCreatedCounts = Ticket::select(
            DB::raw('DATE(created_at) as date'),
            DB::raw('count(*) as count')
        )
            ->whereYear('created_at', $year)
            ->whereMonth('created_at', $month)
            ->groupBy('date')
            ->get()->keyBy(fn($item) => Carbon::parse($item->date)->toDateString());

        $dailyStartedCounts = Ticket::select(
            DB::raw('DATE(started_at) as date'),
            DB::raw('count(*) as count')
        )
            ->whereNotNull('user_id')
            ->whereNotNull('started_at')
            ->whereYear('started_at', $year)
            ->whereMonth('started_at', $month)
            ->groupBy('date')
            ->get()->keyBy(fn($item) => Carbon::parse($item->date)->toDateString());

        $startDate = Carbon::createFromDate($year, $month, 1)->startOfMonth();
        $endDate = $startDate->copy()->endOfMonth();
        $report = [];
        for ($date = $startDate->copy(); $date->lte($endDate); $date->addDay()) {
            $dateString = $date->toDateString();
            $report[] = [
                'date' => $dateString,
                'total' => $dailyCreatedCounts[$dateString]->count ?? 0,
                'dikerjakan' => $dailyStartedCounts[$dateString]->count ?? 0,
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
        $year = $request->input('year');
        $month = $request->input('month');
        $startDate = $request->input('start_date');
        $endDate = $request->input('end_date');

        $baseQuery = Ticket::where('user_id', $adminId);

        if ($startDate && $endDate) {
            $baseQuery->whereBetween('created_at', [$startDate . ' 00:00:00', $endDate . ' 23:59:59']);
        } else {
            if ($year) {
                $baseQuery->whereYear('created_at', $year);
            }
            if ($month) {
                $baseQuery->whereMonth('created_at', $month);
            }
        }

        $statsQuery = clone $baseQuery;

        $stats = $statsQuery->select(
            DB::raw("COUNT(*) as total"),
            DB::raw("SUM(CASE WHEN status = 'Selesai' THEN 1 ELSE 0 END) as completed"),
            DB::raw("SUM(CASE WHEN status = 'Ditolak' THEN 1 ELSE 0 END) as rejected"),
            DB::raw("SUM(CASE WHEN status IN ('Belum Dikerjakan', 'Ditunda', 'Sedang Dikerjakan') THEN 1 ELSE 0 END) as in_progress")
        )->first();

        $paginatedQuery = $baseQuery->with(['user', 'creator', 'workshop']);

        if ($request->has('status') && $request->query('status') !== 'all') {
            $status = $request->query('status');
            $statusMap = [
                'completed' => ['Selesai'],
                'rejected' => ['Ditolak'],
                'in_progress' => ['Belum Dikerjakan', 'Ditunda', 'Sedang Dikerjakan']
            ];
            if (isset($statusMap[$status])) {
                $paginatedQuery->whereIn('status', $statusMap[$status]);
            }
        }

        if ($request->boolean('all')) {
            $ticketsResult = $paginatedQuery->latest()->get();
        } else {
            $perPage = $request->query('per_page', 15);
            $ticketsResult = $paginatedQuery->latest()->paginate($perPage);
        }

        return response()->json([
            'total' => (int) $stats->total,
            'completed' => (int) $stats->completed,
            'rejected' => (int) $stats->rejected,
            'in_progress' => (int) $stats->in_progress,
            'tickets' => $ticketsResult,
        ]);
    }
    /**
     * Menugaskan tiket ke admin.
     */
    public function assign(Request $request, Ticket $ticket)
    {
        if (Auth::user()->role !== 'admin') {
            return response()->json(['error' => 'Hanya admin yang bisa menugaskan tiket.'], 403);
        }

        $validated = $request->validate([
            'user_id' => 'required|exists:users,id',
            'stok_barang_ids' => 'nullable|array',
            'stok_barang_ids.*' => 'required|exists:stok_barangs,id',
        ]);

        $assignee = User::find($validated['user_id']);
        if (!$assignee || $assignee->role !== 'admin') {
            return response()->json(['error' => 'Hanya bisa menugaskan ke sesama admin.'], 422);
        }

        try {
            DB::transaction(function () use ($ticket, $validated, $assignee) {
                $ticket->update([
                    'user_id' => $validated['user_id'],
                    'status' => 'Sedang Dikerjakan',
                    'started_at' => now(),
                ]);

                if (!empty($validated['stok_barang_ids'])) {
                    $statusDipinjamId = DB::table('status_barang')->where('nama_status', 'Dipinjam')->value('id');
                    $itemsToAssign = StokBarang::whereIn('id', $validated['stok_barang_ids'])->get();

                    foreach ($itemsToAssign as $item) {
                        $item->update([
                            'status_id' => $statusDipinjamId,
                            'user_peminjam_id' => $assignee->id,
                            'tanggal_keluar' => now(),
                            'workshop_id' => $ticket->workshop_id,
                            'ticket_id' => $ticket->id,
                            'deskripsi' => 'Dipinjam untuk tiket: ' . $ticket->kode_tiket,
                        ]);
                        $item->histories()->create([
                            'status_id' => $statusDipinjamId,
                            'deskripsi' => 'Dipinjam untuk tiket: ' . $ticket->kode_tiket,
                            'triggered_by_user_id' => Auth::id(),
                            'related_user_id' => $assignee->id,
                            'workshop_id' => $ticket->workshop_id,
                            'event_date' => now(),
                        ]);
                    }
                    $masterBarangSummary = $itemsToAssign->groupBy('master_barang_id')
                        ->map->count();

                    foreach ($masterBarangSummary as $masterId => $quantity) {
                        $ticket->masterBarangs()->syncWithoutDetaching([
                            $masterId => [
                                'quantity_used' => $quantity,
                                'status' => 'dipinjam'
                            ]
                        ]);
                    }
                }
            });
        } catch (\Exception $e) {
            return response()->json(['message' => 'Terjadi kesalahan saat menugaskan tiket: ' . $e->getMessage()], 500);
        }

        return response()->json($ticket->load(['user', 'creator', 'masterBarangs']));
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

        $perPage = $request->query('per_page', 15);

       $query = Ticket::with(['user', 'creator', 'workshop', 'masterBarangs'])
            ->where('user_id', $user->id);

        // Logika pengurutan baru
        $query->orderByRaw("CASE
                                WHEN is_urgent = 1 AND status IN ('Sedang Dikerjakan', 'Ditunda') THEN 0
                                WHEN (is_urgent = 0 OR is_urgent IS NULL) AND status IN ('Sedang Dikerjakan', 'Ditunda') THEN 1
                                ELSE 2
                             END ASC");
        $query->orderBy('updated_at', 'DESC');

        $ticketsData = $query->paginate($perPage);

        return response()->json($ticketsData);
    }

    /**
     * Menolak tiket.
     */
    public function reject(Request $request, Ticket $ticket)
    {
        if (Auth::user()->role !== 'admin') {
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
        $tickets = Ticket::with(['user', 'creator', 'workshop'])
            ->where('creator_id', auth()->id())
            ->latest()
            ->paginate(15);

        return response()->json($tickets);
    }

    /**
     * Hapus beberapa tiket sekaligus (hanya admin).
     */
    public function bulkDelete(Request $request)
    {
        if (Auth::user()->role !== 'admin') {
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
        $user = Auth::user();
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
        $user = Auth::user();

        if ($user->role !== 'admin') {
            return response()->json(['error' => 'Hanya admin yang bisa mengubah status.'], 403);
        }

        if ($ticket->user_id && $ticket->user_id !== $user->id) {
            return response()->json(['error' => 'Anda tidak berhak mengubah status tiket yang sedang dikerjakan oleh admin lain.'], 403);
        }

        $validated = $request->validate(['status' => 'required|string']);
        $newStatus = $validated['status'];
        $updateData = ['status' => $newStatus];

        if ($newStatus === 'Sedang Dikerjakan' && is_null($ticket->started_at)) {
            $updateData['started_at'] = now();
            if (is_null($ticket->user_id)) {
                $updateData['user_id'] = $user->id;
            }
        } elseif ($newStatus === 'Selesai' || $newStatus === 'Ditolak') {
            $updateData['completed_at'] = now();
        }

        $ticket->update($updateData);

        return response()->json($ticket->load(['user', 'creator', 'masterBarangs']));
    }


    /**
     * Statistik tiket.
     */
    public function stats()
    {
        $user = Auth::user();
        $query = Ticket::query();

        if ($user->role !== 'admin') {
            $query->where('user_id', $user->id);
        }

        $counts = $query->select(
            'status',
            DB::raw('count(*) as total')
        )
            ->groupBy('status')
            ->get()
            ->keyBy('status');

        $stats = [
            'belum_dikerjakan' => $counts['Belum Dikerjakan']->total ?? 0,
            'sedang_dikerjakan' => $counts['Sedang Dikerjakan']->total ?? 0,
            'ditunda' => $counts['Ditunda']->total ?? 0,
            'selesai' => $counts['Selesai']->total ?? 0,
            'ditolak' => $counts['Ditolak']->total ?? 0,
        ];
        $totalTickets = array_sum($stats);
        $stats['pending_tickets']   = $stats['belum_dikerjakan'] + $stats['ditunda'] + $stats['sedang_dikerjakan'];
        $stats['completed_tickets'] = $stats['selesai'];
        $stats['rejected_tickets']  = $stats['ditolak'];
        $stats['total_tickets'] = $totalTickets;

        if ($user->role === 'admin') {
            $stats['total_users'] = User::count();
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

        if (Auth::user()->id !== $ticket->user_id) {
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

    public function reportStats(Request $request)
    {
        $query = Ticket::query();

        if ($request->has('year')) {
            $query->whereYear('created_at', $request->year);
        }
        if ($request->has('month')) {
            $query->whereMonth('created_at', $request->month);
        }

        $isHandledReport = $request->has('handled_status');

        $stats = $query->select(
            DB::raw("COUNT(*) as total_created"),
            DB::raw("SUM(CASE WHEN user_id IS NOT NULL THEN 1 ELSE 0 END) as handled"),
            DB::raw("SUM(CASE WHEN status = 'Selesai' THEN 1 ELSE 0 END) as completed"),
            DB::raw("SUM(CASE WHEN status = 'Ditolak' THEN 1 ELSE 0 END) as rejected"),
            DB::raw("SUM(CASE WHEN user_id IS NOT NULL AND status NOT IN ('Selesai', 'Ditolak') THEN 1 ELSE 0 END) as in_progress")
        )->first();

        $result = [
            'total'       => $isHandledReport
                ? (int)$stats->completed + (int)$stats->in_progress
                : (int)$stats->total_created,
            'handled'     => (int) $stats->handled,
            'completed'   => (int) $stats->completed,
            'rejected'    => (int) $stats->rejected,
            'in_progress' => (int) $stats->in_progress,
        ];

        return response()->json($result);
    }

    public function downloadExport(Request $request)
    {
        return $this->export($request);
    }

    public function export(Request $request)
    {
        $validated = $request->validate([
            'type' => 'required|in:pdf,excel',
        ]);

        $query = Ticket::with(['user', 'creator', 'workshop']);
        $query = $this->applyFilters($query, $request);
        $tickets = $query->latest()->get();
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
            $pdf = PDF::loadView('reports.tickets_pdf', compact('tickets', 'title'));
            $pdf->setPaper('a4', 'landscape');

            return $pdf->download($fileName . '.pdf');
        }
    }

    public function getBorrowedItems(Ticket $ticket)
    {
        $statusDipinjamId = DB::table('status_barang')->where('nama_status', 'Dipinjam')->value('id');
        if (!$statusDipinjamId) {
            Log::error('Status "Dipinjam" tidak ditemukan di status_barang.');
            return response()->json([]);
        }

        $searchDescription = 'Dipinjam untuk tiket: ' . $ticket->kode_tiket;

        $borrowedItemIds = DB::table('stok_barang_histories')
            ->where('status_id', $statusDipinjamId)
            ->where('deskripsi', $searchDescription)
            ->distinct()
            ->pluck('stok_barang_id');

        if ($borrowedItemIds->isEmpty()) {
            return response()->json([]);
        }

        $borrowedItems = StokBarang::with('masterBarang:id_m_barang,nama_barang')
            ->whereIn('id', $borrowedItemIds)
            ->select('id', 'master_barang_id', 'kode_unik')
            ->get();

        return response()->json($borrowedItems);
    }

    public function processReturn(Request $request, Ticket $ticket)
    {
        $user = Auth::user();
        if ($user->role !== 'admin') {
            return response()->json(['error' => 'Hanya admin yang bisa mengubah status.'], 403);
        }
        if ($ticket->user_id && $ticket->user_id !== $user->id) {
            return response()->json(['error' => 'Anda tidak berhak menyelesaikan tiket yang sedang dikerjakan oleh admin lain.'], 403);
        }
        $validated = $request->validate([
            'items' => 'present|array',
            'items.*.stok_barang_id' => 'required|exists:stok_barangs,id',
            'items.*.status_id' => 'required|exists:status_barang,id',
            'items.*.keterangan' => 'nullable|string|max:1000',
            'items.*.user_digunakan_id' => 'nullable|exists:users,id',
            'items.*.user_rusak_id' => 'nullable|exists:users,id',
            'items.*.user_hilang_id' => 'nullable|exists:users,id',
        ]);

        DB::transaction(function () use ($ticket, $validated) {
            $adminId = Auth::id();

            foreach ($validated['items'] as $itemData) {
                $stokBarang = StokBarang::find($itemData['stok_barang_id']);
                $newStatus = \App\Models\Status::find($itemData['status_id']);

                if ($stokBarang && $stokBarang->ticket_id === $ticket->id && $newStatus) {

                    $updateData = [
                        'status_id' => $newStatus->id,
                        'deskripsi' => $itemData['keterangan'] ?: null,
                        'user_peminjam_id' => null,
                        'workshop_id' => null,
                        'ticket_id' => null,
                        'tanggal_keluar' => null,
                        'user_perusak_id' => null,
                        'tanggal_rusak' => null,
                        'user_penghilang_id' => null,
                        'tanggal_hilang' => null,
                    ];

                    $relatedUserId = null;

                    switch ($newStatus->nama_status) {
                        case 'Digunakan':
                            $responsibleUserId = $itemData['user_digunakan_id'] ?? $adminId;
                            $updateData['user_peminjam_id'] = $responsibleUserId;
                            $updateData['workshop_id'] = $ticket->workshop_id;
                            $updateData['tanggal_keluar'] = now();
                            $relatedUserId = $responsibleUserId;
                            break;
                        case 'Rusak':
                            $responsibleUserId = $itemData['user_rusak_id'] ?? $adminId;
                            $updateData['user_perusak_id'] = $responsibleUserId;
                            $updateData['tanggal_rusak'] = now();
                            $relatedUserId = $responsibleUserId;
                            break;
                        case 'Hilang':
                            $responsibleUserId = $itemData['user_hilang_id'] ?? $adminId;
                            $updateData['user_penghilang_id'] = $responsibleUserId;
                            $updateData['tanggal_hilang'] = now();
                            $relatedUserId = $responsibleUserId;
                            break;
                    }

                    $stokBarang->update($updateData);

                    $stokBarang->histories()->create([
                        'status_id' => $newStatus->id,
                        'deskripsi' => $itemData['keterangan'] ?: 'Status diubah saat pengembalian tiket: ' . $ticket->kode_tiket,
                        'triggered_by_user_id' => $adminId,
                        'related_user_id' => $relatedUserId,
                        'workshop_id' => $updateData['workshop_id'],
                        'event_date' => now(),
                    ]);
                }
            }

            $ticket->update(['status' => 'Selesai', 'completed_at' => now()]);
        });

        return response()->json($ticket->load(['user', 'creator', 'masterBarangs']));
    }

    private function classifyUrgencyWithAI(string $description): bool
    {
        $apiKey = config('deepseek.api_key');
        $apiEndpoint = config('deepseek.api_endpoint');
        $model = config('deepseek.model');

        if (!$apiKey) {
            Log::error('DeepSeek API Key tidak ditemukan di konfigurasi.');
            return false;
        }
        if (!$model) {
            Log::error('DeepSeek Model tidak ditemukan di konfigurasi.');
            return false;
        }

        $systemPrompt = "You are an assistant specialized in classifying IT support ticket urgency for 'Dtech Company'. 
        Analyze the following ticket description and determine if it's 'Urgent' or 'Not Urgent'. 
        Consider factors like inability to work, system down, security issues, item installation, installation, or widespread impact as Urgent. 
        Respond ONLY with the word 'Urgent' or 'Not Urgent'.";

        $userPrompt = "Ticket Description: \"" . $description . "\"";

        $payload = [
            'model' => $model,
            'messages' => [
                ['role' => 'system', 'content' => $systemPrompt],
                ['role' => 'user', 'content' => $userPrompt]
            ],
            'max_tokens' => 10,
            'temperature' => 0.1,
        ];

        try {
            $response = Http::withToken($apiKey)
                ->timeout(15)
                ->post($apiEndpoint, $payload);

            if ($response->successful()) {
                $result = $response->json();
                $classification = $result['choices'][0]['message']['content'] ?? null;

                if ($classification) {
                    $cleanedClassification = strtolower(trim($classification));
                    if ($cleanedClassification === 'urgent') {
                        return true;
                    }
                } else {
                    Log::warning('Gagal mengekstrak klasifikasi dari respons DeepSeek.', ['response' => $result]);
                }
            } else {
                Log::error('Gagal menghubungi DeepSeek API.', [
                    'status' => $response->status(),
                    'body' => $response->body()
                ]);
            }
        } catch (ConnectionException $e) {
            Log::error('Koneksi ke DeepSeek API gagal.', ['error' => $e->getMessage()]);
        } catch (RequestException $e) {
            Log::error('Request ke DeepSeek API error.', ['error' => $e->getMessage(), 'response' => $e->response?->body()]);
        } catch (\Exception $e) {
            Log::error('Error saat klasifikasi urgensi dengan AI.', ['error' => $e->getMessage()]);
        }

        return false;
    }
}
