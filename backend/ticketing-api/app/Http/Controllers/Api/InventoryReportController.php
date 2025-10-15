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


class InventoryReportController extends Controller
{

    public function exportReport(Request $request)
    {
        // Validasi sekarang memeriksa 'export_type'
        $request->validate([
            'type' => 'required|in:in,out',
            'export_type' => 'required|in:excel,pdf' // Parameter baru untuk tipe ekspor
        ]);

        // Logika query ini sama persis seperti sebelumnya, mengambil semua data tanpa paginasi
        $query = StokBarang::with(['masterBarang', 'statusDetail', 'createdBy', 'userPeminjam', 'userPerusak', 'userPenghilang', 'workshop']);

        $query->when($request->filled('search'), function ($q) use ($request) {
            $searchTerm = '%' . $request->search . '%';
            $q->where(function ($subQuery) use ($searchTerm) {
                $subQuery->where('kode_unik', 'like', $searchTerm)
                    ->orWhereHas('masterBarang', fn($masterQuery) => $masterQuery->where('nama_barang', 'like', $searchTerm));
            });
        });

        if ($request->type === 'in') {
            $query->whereNotNull('tanggal_masuk');
            $query->when($request->filled('start_date'), fn($q) => $q->whereDate('tanggal_masuk', '>=', $request->start_date));
            $query->when($request->filled('end_date'), fn($q) => $q->whereDate('tanggal_masuk', '<=', $request->end_date));
            $query->orderBy('tanggal_masuk', 'desc');
        } else {
            $statusKeluarIds = DB::table('status_barang')->whereIn('nama_status', ['Dipinjam', 'Digunakan', 'Hilang', 'Rusak'])->pluck('id');
            $query->whereIn('status_id', $statusKeluarIds)->whereNotNull('tanggal_keluar');
            $query->when($request->filled('start_date'), fn($q) => $q->whereDate('tanggal_keluar', '>=', $request->start_date));
            $query->when($request->filled('end_date'), fn($q) => $q->whereDate('tanggal_keluar', '<=', $request->end_date));
            $query->orderBy('tanggal_keluar', 'desc');
        }

        $data = $query->get();
        $title = 'Laporan Barang ' . ($request->type === 'in' ? 'Masuk' : 'Keluar');
        $fileName = str_replace(' ', '_', $title) . '_' . now()->format('Ymd');

        // [BARU] Logika untuk memilih tipe ekspor
        if ($request->export_type === 'excel') {
            return Excel::download(new InventoryReportExport($data, $request->type), $fileName . '.xlsx');
        }

        if ($request->export_type === 'pdf') {
            $pdf = PDF::loadView('reports.inventory_report_pdf', [
                'data' => $data,
                'title' => $title,
                'type' => $request->type
            ]);
            // Menggunakan orientasi landscape agar tabel lebih muat
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

        // 1. Total Unit Barang
        $totalUnitBarang = StokBarang::count();

        // 2. Stok Tersedia
        $stokTersedia = StokBarang::where('status_id', $statusIds['Tersedia'] ?? 0)->count();

        // 3. Rusak & Hilang
        $rusakHilangStatusIds = array_filter([$statusIds['Rusak'] ?? null, $statusIds['Hilang'] ?? null]);
        $rusakHilangTotal = StokBarang::whereIn('status_id', $rusakHilangStatusIds)->count();

        // 4. Barang Keluar (Operasional: Dipinjam, Digunakan, Perbaikan)
        $keluarOperasionalStatusIds = array_filter([
            $statusIds['Dipinjam'] ?? null,
            $statusIds['Digunakan'] ?? null,
            $statusIds['Perbaikan'] ?? null,
        ]);
        $barangKeluarOperasional = StokBarang::whereIn('status_id', $keluarOperasionalStatusIds)->count();

        // === KALKULASI DATA PENDUKUNG (Chart, Widget, dll) ===
        $year = $request->input('year', Carbon::now()->year);
        $keluarSemuaStatusIds = $this->getKeluarStatusIds($statusIds); // Untuk chart, kita hitung semua yang keluar
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
                'barang_keluar' => $barangKeluarOperasional, // Data baru untuk kartu "Barang Keluar"
            ],
            'chartData' => $chartData,
            'mostActiveItems' => $mostActiveItems,
            'availableYears' => $yearsWithData,
        ]);
    }

    public function getDetailedReport(Request $request)
    {
        $request->validate([
            'type' => 'required|in:in,out,available,accountability',
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date|after_or_equal:start_date',
            'search' => 'nullable|string|max:255',
        ]);

        $query = StokBarang::with(['masterBarang.masterKategori', 'userPeminjam', 'workshop', 'statusDetail', 'createdBy', 'userPerusak', 'userPenghilang', 'teknisiPerbaikan']);

        $query->when($request->filled('search'), function ($q) use ($request) {
            $searchTerm = '%' . $request->search . '%';
            $q->where(function ($subQuery) use ($searchTerm) {
                $subQuery->where('kode_unik', 'like', $searchTerm)
                    ->orWhereHas('masterBarang', function ($masterQuery) use ($searchTerm) {
                        $masterQuery->where('nama_barang', 'like', $searchTerm);
                    });
            });
        });

        // [LOGIKA DIPERBARUI]
        if ($request->type === 'in') {
            // Laporan Masuk: Menampilkan SEMUA barang kecuali yang statusnya 'Hilang'.
            $statusHilangId = DB::table('status_barang')->where('nama_status', 'Hilang')->value('id');
            $query->where('status_id', '!=', $statusHilangId);

            // Filter tanggal tetap berlaku pada tanggal masuk barang (pendaftaran awal)
            $query->when($request->filled('start_date'), fn($q) => $q->whereDate('tanggal_masuk', '>=', $request->start_date));
            $query->when($request->filled('end_date'), fn($q) => $q->whereDate('tanggal_masuk', '<=', $request->end_date));

            // Urutkan berdasarkan yang paling baru ditambahkan
            $query->orderBy('tanggal_masuk', 'desc');
        } elseif ($request->type === 'out') {
            // Laporan Keluar: HANYA menampilkan status 'Dipinjam' dan 'Digunakan'
            $statusKeluarIds = DB::table('status_barang')->whereIn('nama_status', ['Dipinjam', 'Digunakan'])->pluck('id');
            $query->whereIn('status_id', $statusKeluarIds);

            $query->when($request->filled('start_date'), fn($q) => $q->whereDate('tanggal_keluar', '>=', $request->start_date));
            $query->when($request->filled('end_date'), fn($q) => $q->whereDate('tanggal_keluar', '<=', $request->end_date));

            $query->orderBy('tanggal_keluar', 'desc');
        } elseif ($request->type === 'available') {
            // Laporan Tersedia: Tidak berubah
            $statusTersediaId = DB::table('status_barang')->where('nama_status', 'Tersedia')->value('id');
            $query->where('status_id', $statusTersediaId);
            $query->orderBy('created_at', 'desc');
        } elseif ($request->type === 'accountability') {
            // Laporan Hilang/Rusak: Sekarang hanya berisi 'Hilang' dan 'Rusak' dan 'Perbaikan'
            $statusIds = DB::table('status_barang')->whereIn('nama_status', ['Hilang', 'Rusak', 'Perbaikan'])->pluck('id');
            $query->whereIn('status_id', $statusIds);
            $query->orderBy('updated_at', 'desc');
        }

        return $query->paginate($request->input('per_page', 15));
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
