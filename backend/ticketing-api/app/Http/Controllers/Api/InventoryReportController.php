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
            ->whereIn('nama_status', ['Tersedia', 'Dipinjam', 'Digunakan', 'Hilang', 'Rusak'])
            ->pluck('id', 'nama_status');

        $totalUnitBarang = StokBarang::count();
        $stokTersedia = StokBarang::where('status_id', $statusIds['Tersedia'] ?? 0)->count();
        $activeSkuCount = MasterBarang::whereHas('stokBarangs')->count();
        $masukLast30Days = StokBarang::whereBetween('tanggal_masuk', [Carbon::now()->subDays(30), Carbon::now()])->count();
        $keluarLast30Days = StokBarang::whereIn('status_id', $this->getKeluarStatusIds($statusIds))
            ->whereBetween('tanggal_keluar', [Carbon::now()->subDays(30), Carbon::now()])
            ->count();

        $keluarPrevious30Days = StokBarang::whereIn('status_id', $this->getKeluarStatusIds($statusIds))
            ->whereBetween('tanggal_keluar', [Carbon::now()->subDays(60), Carbon::now()->subDays(31)])
            ->count();

        $trendDifference = $keluarLast30Days - $keluarPrevious30Days;
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
                'total_sku' => MasterBarang::count(),
                'active_sku' => $activeSkuCount,
                'barang_masuk_30_hari' => $masukLast30Days,
                'total_unit_barang' => $totalUnitBarang,
                'stok_tersedia' => $stokTersedia,
                'barang_keluar_30_hari' => $keluarLast30Days,
                'persentase_stok_tersedia' => $totalUnitBarang > 0 ? round(($stokTersedia / $totalUnitBarang) * 100) : 0,
                'trend' => [
                    'direction' => $trendDifference > 0 ? 'up' : ($trendDifference < 0 ? 'down' : 'stable'),
                    'difference' => abs($trendDifference),
                ]
            ],
            'chartData' => $chartData,
            'mostActiveItems' => $mostActiveItems,
            'availableYears' => $yearsWithData,
        ]);
    }

    public function getDetailedReport(Request $request)
    {
        $request->validate([
            'type' => 'required|in:in,out',
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date|after_or_equal:start_date',
            'search' => 'nullable|string|max:255',
        ]);

        $query = StokBarang::with(['masterBarang.masterKategori', 'userPeminjam', 'workshop', 'statusDetail', 'createdBy', 'userPerusak', 'userPenghilang']);
        $query->when($request->filled('search'), function ($q) use ($request) {
            $searchTerm = '%' . $request->search . '%';
            $q->where(function ($subQuery) use ($searchTerm) {
                $subQuery->where('kode_unik', 'like', $searchTerm)
                    ->orWhereHas('masterBarang', function ($masterQuery) use ($searchTerm) {
                        $masterQuery->where('nama_barang', 'like', $searchTerm);
                    });
            });
        });
        if ($request->type === 'in') {
            $query->whereNotNull('tanggal_masuk');
            $query->when($request->filled('start_date'), fn($q) => $q->whereDate('tanggal_masuk', '>=', $request->start_date));
            $query->when($request->filled('end_date'), fn($q) => $q->whereDate('tanggal_masuk', '<=', $request->end_date));
            $query->orderBy('tanggal_masuk', 'desc');
        } elseif ($request->type === 'out') {
            $statusKeluarIds = DB::table('status_barang')->whereIn('nama_status', ['Dipinjam', 'Digunakan', 'Hilang', 'Rusak'])->pluck('id');
            $query->whereIn('status_id', $statusKeluarIds)->whereNotNull('tanggal_keluar');
            $query->when($request->filled('start_date'), fn($q) => $q->whereDate('tanggal_keluar', '>=', $request->start_date));
            $query->when($request->filled('end_date'), fn($q) => $q->whereDate('tanggal_keluar', '<=', $request->end_date));
            $query->orderBy('tanggal_keluar', 'desc');
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
