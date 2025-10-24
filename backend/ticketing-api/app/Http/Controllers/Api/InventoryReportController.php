<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\MasterBarang;
use App\Models\StokBarang;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB; // <-- Pastikan DB di-import
use Carbon\Carbon;
use App\Exports\InventoryReportExport;
use Maatwebsite\Excel\Facades\Excel;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Support\Facades\Log;


class InventoryReportController extends Controller
{

    public function exportReport(Request $request)
    {
        // --- PERBAIKAN (Blok Validasi) ---
        // Validasi disamakan dengan buildReportQuery
        $request->validate([
            'type' => 'required|in:in,out,active_loans,all_stock,available,accountability',
            'export_type' => 'required|in:excel,pdf',
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date|after_or_equal:start_date',
            'search' => 'nullable|string|max:255',
            'has_history' => 'nullable|boolean', // <-- Tambahkan ini
        ]);

        // --- PERBAIKAN (Query) ---
        // Panggil fungsi query terpusat kita
        $query = $this->buildReportQuery($request);

        // Ambil datanya
        $data = $query->get();

        // --- PERBAIKAN (Judul) ---
        // Tentukan Judul Laporan (Logika ini tetap di sini)
        $title = 'Laporan Inventaris';
        switch ($request->type) {
            case 'in':
                $title = 'Laporan Barang Jadi Tersedia';
                break;
            case 'out':
                $title = 'Laporan Barang Keluar';
                break;
            case 'accountability':
                $title = 'Laporan Pertanggungjawaban Aset';
                break;
            case 'available':
                $title = 'Laporan Barang Tersedia';
                break;
            case 'active_loans':
                $title = 'Laporan Peminjaman Aktif';
                break;
            case 'all_stock':
                $title = 'Laporan Riwayat Aset';
                break; // <-- Judul diperbaiki
        }

        // --- Logika Ekspor (Tidak Berubah) ---
        $fileName = str_replace(' ', '_', $title) . '_' . now()->format('Ymd');

        if ($request->export_type === 'excel') {
            return Excel::download(new InventoryReportExport($data, $request->type), $fileName . '.xlsx');
        }

        if ($request->export_type === 'pdf') {
            $pdf = PDF::loadView('reports.inventory_report_pdf', [
                'data' => $data,
                'title' => $title,
                'type' => $request->type
            ]);
            $pdf->setPaper('a4', 'landscape');
            return $pdf->download($fileName . '.pdf');
        }
    }

    public function getDashboardData(Request $request)
    {
        // ... (Fungsi ini tidak diubah) ...
        $statusIds = DB::table('status_barang')
            ->whereIn('nama_status', ['Tersedia', 'Dipinjam', 'Digunakan', 'Hilang', 'Rusak', 'Perbaikan'])
            ->pluck('id', 'nama_status');

        $totalUnitBarang = StokBarang::count();
        $stokTersedia = StokBarang::where('status_id', $statusIds['Tersedia'] ?? 0)->count();
        $rusakHilangStatusIds = array_filter([$statusIds['Rusak'] ?? null, $statusIds['Hilang'] ?? null, $statusIds['Perbaikan'] ?? null]);
        $rusakHilangTotal = StokBarang::whereIn('status_id', $rusakHilangStatusIds)->count();
        $keluarOperasionalStatusIds = array_filter([
            $statusIds['Dipinjam'] ?? null,
            $statusIds['Digunakan'] ?? null,
        ]);
        $barangKeluarOperasional = StokBarang::whereIn('status_id', $keluarOperasionalStatusIds)->count();

        $year = $request->input('year', Carbon::now()->year);
        $chartData = $this->getMonthlyMovementData($year);

        $mostActiveItems = StokBarang::select('master_barang_id', DB::raw('count(*) as total_keluar'))
            ->with('masterBarang:id_m_barang,nama_barang')
            ->whereIn('status_id', $this->getKeluarStatusIds($statusIds))
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


    // --- PERBAIKAN ---
    // Fungsi ini sekarang menjadi wrapper sederhana
    public function getDetailedReport(Request $request)
    {
        $request->validate([
            'type' => 'required|in:in,out,available,accountability,active_loans,all_stock', // <-- Tambahkan all_stock
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date|after_or_equal:start_date',
            'search' => 'nullable|string|max:255',
            'has_history' => 'nullable|boolean', // <-- Tambahkan ini
        ]);

        $perPage = $request->input('per_page', 15);
        $getAll = $request->boolean('all');

        // Panggil fungsi query terpusat kita
        $query = $this->buildReportQuery($request);

        // Kembalikan data (paginasi atau semua)
        if ($getAll) {
            return $query->get();
        }
        return $query->paginate($perPage);
    }


    /*
    |--------------------------------------------------------------------------
    | FUNGSI HELPER PRIBADI
    |--------------------------------------------------------------------------
    */

    // --- FUNGSI LAMA (TIDAK BERUBAH) ---
    private function getKeluarStatusIds($statusIds)
    {
        // ... (Tidak berubah) ...
        return array_filter([
            $statusIds['Dipinjam'] ?? null,
            $statusIds['Digunakan'] ?? null,
            $statusIds['Hilang'] ?? null,
            $statusIds['Rusak'] ?? null,
        ]);
    }
    private function getMonthlyMovementData($year)
    {
        // ... (Tidak berubah) ...
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

    // --- PERBAIKAN (FUNGSI HELPER BARU) ---
    /**
     * Membangun query dasar untuk laporan inventaris (UI dan Ekspor)
     * agar logikanya terpusat di satu tempat.
     */
    private function buildReportQuery(Request $request)
    {
        $type = $request->type;
        $statusTersediaId = DB::table('status_barang')->where('nama_status', 'Tersedia')->value('id');

        // Tentukan apakah kita query 'stok_barangs' (state) atau 'stok_barang_histories' (log)
        if (in_array($type, ['available', 'active_loans', 'all_stock'])) {
            $query = StokBarang::with([
                'masterBarang',
                'statusDetail',
                'createdBy',
                'userPeminjam',
                'workshop',
                'color',
                'userPerusak',
                'userPenghilang',
                'teknisiPerbaikan'
            ]);

            switch ($type) {
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

                case 'all_stock':
                    // INI ADALAH LOGIKA UNTUK 'LACAK RIWAYAT ASET'
                    // Kita samakan dengan logika di StokBarangController@index
                    $query->when($request->boolean('has_history') || $request->filled('start_date') || $request->filled('end_date'), function ($q) use ($request) {
                        $q->whereHas('histories', function ($historyQuery) use ($request) {
                            // Filter tanggal hanya jika 'has_history' aktif atau tanggal diisi
                            if ($request->filled('start_date')) {
                                $historyQuery->whereDate('event_date', '>=', $request->start_date);
                            }
                            if ($request->filled('end_date')) {
                                $historyQuery->whereDate('event_date', '<=', $request->end_date);
                            }
                        });
                    });
                    $query->orderBy('created_at', 'desc');
                    break;
            }

            // Filter Pencarian untuk StokBarang
            $query->when($request->filled('search'), function ($q) use ($request) {
                $searchTerm = '%' . $request->search . '%';
                $q->where(function ($subQuery) use ($searchTerm) {
                    $subQuery->where('kode_unik', 'like', $searchTerm)
                        ->orWhere('serial_number', 'like', $searchTerm)
                        ->orWhereHas('masterBarang', fn($masterQuery) => $masterQuery->where('nama_barang', 'like', $searchTerm))
                        ->orWhereHas('userPeminjam', fn($userQuery) => $userQuery->where('name', 'like', $searchTerm));
                });
            });
        } else {
            // Query History untuk 'in', 'out', 'accountability'
            $query = \App\Models\StokBarangHistory::with([
                'stokBarang.masterBarang',
                'stokBarang.color',
                'stokBarang.statusDetail', // <-- Ambil status stok saat ini
                'statusDetail', // Status saat kejadian history
                'triggeredByUser:id,name',
                'relatedUser:id,name',
                'workshop:id,name'
            ]);

            $statusMap = [
                'in' => [$statusTersediaId],
                'out' => DB::table('status_barang')->whereIn('nama_status', ['Dipinjam', 'Digunakan'])->pluck('id')->toArray(),
                'accountability' => DB::table('status_barang')->whereIn('nama_status', ['Hilang', 'Rusak', 'Perbaikan'])->pluck('id')->toArray()
            ];

            $targetStatusIds = $statusMap[$type] ?? [];
            if (empty($targetStatusIds)) {
                Log::error("Status target tidak ditemukan untuk tipe laporan: {$request->type}");
                // Hentikan query jika tipe tidak valid
                return $query->whereRaw('1=0');
            }
            $query->whereIn('status_id', $targetStatusIds);

            // Filter Tanggal History
            $query->when($request->filled('start_date'), fn($q) => $q->whereDate(DB::raw('COALESCE(event_date, created_at)'), '>=', $request->start_date));
            $query->when($request->filled('end_date'), fn($q) => $q->whereDate(DB::raw('COALESCE(event_date, created_at)'), '<=', $request->end_date));

            // Filter Pencarian History
            $query->when($request->filled('search'), function ($q) use ($request) {
                $searchTerm = '%' . $request->search . '%';
                $q->whereHas('stokBarang', function ($stokQuery) use ($searchTerm) {
                    $stokQuery->where('kode_unik', 'like', $searchTerm)
                        ->orWhere('serial_number', 'like', $searchTerm)
                        ->orWhereHas('masterBarang', fn($masterQuery) => $masterQuery->where('nama_barang', 'like', $searchTerm));
                })->orWhereHas('triggeredByUser', fn($userQuery) => $userQuery->where('name', 'like', $searchTerm));
            });

            // Urutkan
            $query->orderBy(DB::raw('COALESCE(event_date, created_at)'), 'desc');
        }

        return $query;
    }
}
