<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\MasterBarang;
use App\Models\StokBarang;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;
use App\Exports\InventoryReportExport;
use Maatwebsite\Excel\Facades\Excel;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Support\Facades\Log;


class InventoryReportController extends Controller
{

    public function exportReport(Request $request)
    {
        $request->validate([
            'type' => 'required|in:in,out,active_loans,all_stock,available,accountability', // Tambahkan available & accountability jika perlu diekspor juga
            'export_type' => 'required|in:excel,pdf',
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date|after_or_equal:start_date',
            'search' => 'nullable|string|max:255',
        ]);

        $title = 'Laporan Inventaris';
        $data = collect(); // Inisialisasi collection kosong

        // --- Logika Query disamakan dengan getDetailedReport ---

        $statusTersediaId = DB::table('status_barang')->where('nama_status', 'Tersedia')->value('id');

        if (in_array($request->type, ['available', 'active_loans', 'all_stock'])) { // all_stock juga pakai StokBarang
            $query = StokBarang::with(['masterBarang', 'statusDetail', 'createdBy', 'userPeminjam', 'workshop', 'color']);

            switch ($request->type) {
                // (Kasus 'available', 'active_loans', 'all_stock' sama seperti di getDetailedReport)
                 case 'available':
                    $query->where('status_id', $statusTersediaId);
                    $query->orderBy('created_at', 'desc');
                    $title = 'Laporan Barang Tersedia';
                    break;
                 case 'active_loans':
                    $statusPeminjamanIds = DB::table('status_barang')->whereIn('nama_status', ['Dipinjam', 'Digunakan'])->pluck('id');
                    $query->whereIn('status_id', $statusPeminjamanIds);
                    $query->when($request->filled('start_date'), fn($q) => $q->whereDate('tanggal_keluar', '>=', $request->start_date));
                    $query->when($request->filled('end_date'), fn($q) => $q->whereDate('tanggal_keluar', '<=', $request->end_date));
                    $query->orderBy('tanggal_keluar', 'asc');
                    $title = 'Laporan Peminjaman Aktif';
                    break;
                 case 'all_stock':
                     // Mungkin tidak perlu filter tanggal spesifik, hanya search
                    $query->orderBy('created_at', 'desc');
                    $title = 'Laporan Stok Aset Total';
                    break;
            }

            // Filter Pencarian StokBarang (sama seperti getDetailedReport)
            $query->when($request->filled('search'), function ($q) use ($request) {
                 $searchTerm = '%' . $request->search . '%';
                 $q->where(function ($subQuery) use ($searchTerm) {
                    $subQuery->where('kode_unik', 'like', $searchTerm)
                        ->orWhere('serial_number', 'like', $searchTerm)
                        ->orWhereHas('masterBarang', fn($masterQuery) => $masterQuery->where('nama_barang', 'like', $searchTerm))
                        ->orWhereHas('userPeminjam', fn($userQuery) => $userQuery->where('name', 'like', $searchTerm));
                 });
            });

            $data = $query->get(); // Ambil semua data untuk ekspor

        } else { // Untuk type 'in', 'out', 'accountability' pakai History
            $query = \App\Models\StokBarangHistory::with([
                'stokBarang.masterBarang',
                'stokBarang.color',
                'statusDetail',
                'triggeredByUser:id,name',
                'relatedUser:id,name',
                'workshop:id,name'
            ]);

            $statusMapExport = [
                'in' => [$statusTersediaId],
                'out' => DB::table('status_barang')->whereIn('nama_status', ['Dipinjam', 'Digunakan'])->pluck('id')->toArray(),
                'accountability' => DB::table('status_barang')->whereIn('nama_status', ['Hilang', 'Rusak', 'Perbaikan'])->pluck('id')->toArray()
            ];
             $targetStatusIds = $statusMapExport[$request->type] ?? [];
             $query->whereIn('status_id', $targetStatusIds);

            // Filter Tanggal History (sama seperti getDetailedReport)
            $query->when($request->filled('start_date'), fn($q) => $q->whereDate(DB::raw('COALESCE(event_date, created_at)'), '>=', $request->start_date));
            $query->when($request->filled('end_date'), fn($q) => $q->whereDate(DB::raw('COALESCE(event_date, created_at)'), '<=', $request->end_date));

            // Filter Pencarian History (sama seperti getDetailedReport)
             $query->when($request->filled('search'), function ($q) use ($request) {
                // ... (copy paste filter search history dari getDetailedReport) ...
                 $searchTerm = '%' . $request->search . '%';
                 $q->whereHas('stokBarang', function ($stokQuery) use ($searchTerm) {
                     $stokQuery->where('kode_unik', 'like', $searchTerm)
                         ->orWhere('serial_number', 'like', $searchTerm) // Cari SN juga
                         ->orWhereHas('masterBarang', fn($masterQuery) => $masterQuery->where('nama_barang', 'like', $searchTerm));
                 })->orWhereHas('triggeredByUser', fn($userQuery) => $userQuery->where('name', 'like', $searchTerm));
             });

            // Sorting History (sama seperti getDetailedReport)
            $query->orderBy(DB::raw('COALESCE(event_date, created_at)'), 'desc');

            // Set Judul Spesifik
             switch ($request->type) {
                case 'in': $title = 'Laporan Barang Jadi Tersedia'; break;
                case 'out': $title = 'Laporan Barang Keluar'; break;
                case 'accountability': $title = 'Laporan Pertanggungjawaban Aset'; break;
             }

            $data = $query->get(); // Ambil semua data untuk ekspor
        }


        // --- Logika Ekspor (Tidak Berubah) ---
        $fileName = str_replace(' ', '_', $title) . '_' . now()->format('Ymd');

        if ($request->export_type === 'excel') {
             // Pastikan class Export disesuaikan untuk handle data History jika perlu
            return Excel::download(new InventoryReportExport($data, $request->type), $fileName . '.xlsx');
        }

        if ($request->export_type === 'pdf') {
             // Pastikan view PDF disesuaikan untuk handle data History jika perlu
            $pdf = PDF::loadView('reports.inventory_report_pdf', [
                'data' => $data,
                'title' => $title,
                'type' => $request->type // Kirim tipe agar view bisa menyesuaikan kolom
            ]);
            $pdf->setPaper('a4', 'landscape');
            return $pdf->download($fileName . '.pdf');
        }
    }

    public function getDashboardData(Request $request)
    {
        $statusIds = DB::table('status_barang')
            ->whereIn('nama_status', ['Tersedia', 'Dipinjam', 'Digunakan', 'Hilang', 'Rusak', 'Perbaikan'])
            ->pluck('id', 'nama_status');

        // === KALKULASI UNTUK 4 KARTU UTAMA ===
        $totalUnitBarang = StokBarang::count();
        $stokTersedia = StokBarang::where('status_id', $statusIds['Tersedia'] ?? 0)->count();
        $rusakHilangStatusIds = array_filter([$statusIds['Rusak'] ?? null, $statusIds['Hilang'] ?? null, $statusIds['Perbaikan'] ?? null]);
        $rusakHilangTotal = StokBarang::whereIn('status_id', $rusakHilangStatusIds)->count();
        $keluarOperasionalStatusIds = array_filter([
            $statusIds['Dipinjam'] ?? null,
            $statusIds['Digunakan'] ?? null,
            
        ]);
        $barangKeluarOperasional = StokBarang::whereIn('status_id', $keluarOperasionalStatusIds)->count();

        // === KALKULASI DATA PENDUKUNG (Chart, Widget, dll) ===
        $year = $request->input('year', Carbon::now()->year);
        $keluarSemuaStatusIds = $this->getKeluarStatusIds($statusIds);
        $chartData = $this->getMonthlyMovementData($year, $keluarSemuaStatusIds);

        $mostActiveItems = StokBarang::select('master_barang_id', DB::raw('count(*) as total_keluar'))
            ->with('masterBarang:id_m_barang,nama_barang')
            ->whereIn('status_id', $keluarSemuaStatusIds)
            ->whereNotNull('tanggal_keluar')
            ->whereYear('tanggal_keluar', Carbon::now()->year)
            ->groupBy('master_barang_id')
            ->orderBy('total_keluar', 'desc')
            ->limit(5)
            ->get();

        $yearsWithData = StokBarang::select(DB::raw('DISTINCT YEAR(tanggal_masuk) as year'))
            ->whereNotNull('tanggal_masuk')
            ->orderBy('year', 'desc')
            ->pluck('year');

        // === RESPONSE JSON ===
        return response()->json([
            'stats' => [
                'total_unit_barang' => $totalUnitBarang,
                'stok_tersedia' => $stokTersedia,
                'persentase_stok_tersedia' => $totalUnitBarang > 0 ? round(($stokTersedia / $totalUnitBarang) * 100) : 0,
                'rusak_hilang_total' => $rusakHilangTotal,
                'barang_keluar' => $barangKeluarOperasional,
            ],
            'chartData' => $chartData,
            'mostActiveItems' => $mostActiveItems,
            'availableYears' => $yearsWithData,
        ]);
    }

    public function getDetailedReport(Request $request)
    {
        $request->validate([
            'type' => 'required|in:in,out,available,accountability,active_loans',
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date|after_or_equal:start_date',
            'search' => 'nullable|string|max:255',
        ]);

        $perPage = $request->input('per_page', 15);
        $getAll = $request->boolean('all');

        // --- Logika Baru: Tentukan ID Status "Tersedia" ---
        $statusTersediaId = DB::table('status_barang')->where('nama_status', 'Tersedia')->value('id');
        if (!$statusTersediaId) {
             Log::error('Status "Tersedia" tidak ditemukan dalam database.');
             // Kamu bisa melempar error atau mengembalikan respons kosong
             return response()->json(['error' => 'Konfigurasi status tidak ditemukan.'], 500);
        }

        // --- Query Utama (Default: StokBarang untuk available & active_loans) ---
        // --- Tipe 'in', 'out', 'accountability' akan menggunakan query history di bawah ---
        if (in_array($request->type, ['available', 'active_loans'])) {
            $query = StokBarang::with(['masterBarang', 'statusDetail', 'createdBy', 'workshop', 'userPeminjam', 'color']); // Tambahkan color

            switch ($request->type) {
                case 'available':
                    $query->where('status_id', $statusTersediaId);
                    $query->orderBy('created_at', 'desc');
                    break;

                case 'active_loans':
                    $statusPeminjamanIds = DB::table('status_barang')->whereIn('nama_status', ['Dipinjam', 'Digunakan'])->pluck('id');
                    $query->whereIn('status_id', $statusPeminjamanIds);
                    $query->when($request->filled('start_date'), fn($q) => $q->whereDate('tanggal_keluar', '>=', $request->start_date));
                    $query->when($request->filled('end_date'), fn($q) => $q->whereDate('tanggal_keluar', '<=', $request->end_date));
                    $query->orderBy('tanggal_keluar', 'asc');
                    break;
            }

            // Filter Pencarian untuk StokBarang
            $query->when($request->filled('search'), function ($q) use ($request) {
                $searchTerm = '%' . $request->search . '%';
                $q->where(function ($subQuery) use ($searchTerm) {
                    $subQuery->where('kode_unik', 'like', $searchTerm)
                        ->orWhere('serial_number', 'like', $searchTerm) // Tambahkan pencarian SN
                        ->orWhereHas('masterBarang', fn($masterQuery) => $masterQuery->where('nama_barang', 'like', $searchTerm))
                        ->orWhereHas('userPeminjam', fn($userQuery) => $userQuery->where('name', 'like', $searchTerm));
                });
            });

            // Hasil untuk 'available' & 'active_loans'
            if ($getAll) {
                return $query->get();
            }
            return $query->paginate($perPage);

        } else {
             // --- Query History untuk 'in', 'out', 'accountability' ---
             $query = \App\Models\StokBarangHistory::with([ // Pastikan namespace benar
                'stokBarang.masterBarang',
                'stokBarang.color', // Eager load color dari StokBarang
                'statusDetail', // Status saat kejadian history
                'triggeredByUser:id,name', // User yang memicu perubahan status
                'relatedUser:id,name', // User terkait (peminjam, perusak, dll.)
                'workshop:id,name'
            ]);

            $statusMap = [
                'in' => [$statusTersediaId], // <-- Logika Baru untuk 'in'
                'out' => DB::table('status_barang')->whereIn('nama_status', ['Dipinjam', 'Digunakan'])->pluck('id')->toArray(),
                'accountability' => DB::table('status_barang')->whereIn('nama_status', ['Hilang', 'Rusak', 'Perbaikan'])->pluck('id')->toArray()
            ];

            $targetStatusIds = $statusMap[$request->type] ?? []; // Ambil ID status target
            if (empty($targetStatusIds)) {
                 Log::error("Status target tidak ditemukan untuk tipe laporan: {$request->type}");
                 return response()->json(['error' => 'Konfigurasi status laporan tidak valid.'], 500);
            }
            $query->whereIn('status_id', $targetStatusIds); // Filter berdasarkan status_id di history

            // Filter Tanggal berdasarkan event_date (atau created_at jika event_date null)
            $query->when($request->filled('start_date'), fn($q) => $q->whereDate(DB::raw('COALESCE(event_date, created_at)'), '>=', $request->start_date));
            $query->when($request->filled('end_date'), fn($q) => $q->whereDate(DB::raw('COALESCE(event_date, created_at)'), '<=', $request->end_date));

            // Filter Pencarian untuk History
             $query->when($request->filled('search'), function ($q) use ($request) {
                 $searchTerm = '%' . $request->search . '%';
                 $q->whereHas('stokBarang', function ($stokQuery) use ($searchTerm) {
                     $stokQuery->where('kode_unik', 'like', $searchTerm)
                         ->orWhere('serial_number', 'like', $searchTerm) // Cari SN juga
                         ->orWhereHas('masterBarang', fn($masterQuery) => $masterQuery->where('nama_barang', 'like', $searchTerm));
                 })->orWhereHas('triggeredByUser', fn($userQuery) => $userQuery->where('name', 'like', $searchTerm)); // Cari berdasarkan user pemicu
             });

            // Urutkan berdasarkan tanggal kejadian (atau pembuatan history) terbaru
            $query->orderBy(DB::raw('COALESCE(event_date, created_at)'), 'desc');

            // Hasil untuk 'in', 'out', 'accountability'
            if ($getAll) {
                return $query->get();
            }
            return $query->paginate($perPage);
        }
    }


    /*
    |--------------------------------------------------------------------------
    | FUNGSI HELPER PRIBADI
    |--------------------------------------------------------------------------
    */

    private function getKeluarStatusIds($statusIds)
    {
        return array_filter([
            $statusIds['Dipinjam'] ?? null,
            $statusIds['Digunakan'] ?? null,
            $statusIds['Hilang'] ?? null,
            $statusIds['Rusak'] ?? null,
        ]);
    }
    private function getMonthlyMovementData($year)
    {
        $barangMasuk = StokBarang::select(DB::raw('MONTH(tanggal_masuk) as month'), DB::raw('count(*) as count'))
            ->whereYear('tanggal_masuk', $year)->groupBy('month')->pluck('count', 'month')->all();

        $barangKeluar = StokBarang::select(DB::raw('MONTH(tanggal_keluar) as month'), DB::raw('count(*) as count'))
            ->whereYear('tanggal_keluar', $year)->whereNotNull('tanggal_keluar')->groupBy('month')->pluck('count', 'month')->all();

        $labels = [];
        $dataMasuk = [];
        $dataKeluar = [];
        for ($m = 1; $m <= 12; $m++) {
            $labels[] = Carbon::create()->month($m)->format('F');
            $dataMasuk[] = $barangMasuk[$m] ?? 0;
            $dataKeluar[] = $barangKeluar[$m] ?? 0;
        }

        return [
            'labels' => $labels,
            'datasets' => [
                ['label' => 'Barang Masuk', 'data' => $dataMasuk, 'borderColor' => '#4CAF50', 'backgroundColor' => 'rgba(76, 175, 80, 0.2)'],
                ['label' => 'Barang Keluar', 'data' => $dataKeluar, 'borderColor' => '#F44336', 'backgroundColor' => 'rgba(244, 67, 54, 0.2)']
            ]
        ];
    }
}
