<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\StokBarang;
use Illuminate\Support\Facades\DB;
use App\Exports\FinancialReportExport;
use Maatwebsite\Excel\Facades\Excel;
use Barryvdh\DomPDF\Facade\Pdf;

class FinancialReportController extends Controller
{
    /**
     * Menyediakan data laporan keuangan untuk inventaris.
     */
    public function getInventoryReport(Request $request)
    {
        // Validasi input filter
        $request->validate([
            'year' => 'nullable|integer|digits:4',
            'month' => 'nullable|integer|between:1,12',
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date|after_or_equal:start_date',
        ]);

        $year = $request->input('year');
        $month = $request->input('month');
        $startDate = $request->input('start_date');
        $endDate = $request->input('end_date');

        // --- Perhitungan Aset Baru (Akuisisi) pada Periode Terpilih ---
        $newAssetsQuery = StokBarang::query();
        if ($startDate && $endDate) {
            $newAssetsQuery->whereBetween('tanggal_pembelian', [$startDate, $endDate]);
        } else {
            if ($year) $newAssetsQuery->whereYear('tanggal_pembelian', $year);
            if ($month) $newAssetsQuery->whereMonth('tanggal_pembelian', $month);
        }

        // --- Perhitungan Total Aset & Aset Bermasalah (Hingga Akhir Periode) ---
        $cumulativeAssetsQuery = StokBarang::query();
        if ($endDate) {
            // Jika pakai rentang tanggal, hitung semua aset yg dibeli s.d. tanggal akhir
            $cumulativeAssetsQuery->where('tanggal_pembelian', '<=', $endDate);
        } elseif ($year) {
            // Jika pakai bulan/tahun, gunakan logika lama
            $cumulativeAssetsQuery->where(function ($q) use ($year, $month) {
                $q->whereYear('tanggal_pembelian', '<', $year)
                    ->orWhere(function ($q2) use ($year, $month) {
                        $q2->whereYear('tanggal_pembelian', $year);
                        if ($month) {
                            $q2->whereMonth('tanggal_pembelian', '<=', $month);
                        }
                    });
            });
        }

        $newAssetValue30Days = StokBarang::where('tanggal_pembelian', '>=', now()->subDays(30))->sum('harga_beli');

        $problematicStatusIds = DB::table('status_barang')->whereIn('nama_status', ['Rusak', 'Hilang'])->pluck('id');

        // Lakukan perhitungan
        $newAssetValue = $newAssetsQuery->sum('harga_beli');
        $totalAssetValue = $cumulativeAssetsQuery->sum('harga_beli');
        $problematicAssetValue = (clone $cumulativeAssetsQuery)->whereIn('status_id', $problematicStatusIds)->sum('harga_beli');

        return response()->json([
            'new_asset_value' => (float) $newAssetValue,
            'new_asset_value_30_days' => (float) $newAssetValue30Days,
            'total_asset_value' => (float) $totalAssetValue,
            'problematic_asset_value' => (float) $problematicAssetValue,
            'net_asset_value' => (float) ($totalAssetValue - $problematicAssetValue),
        ]);
    }

    public function getDetailedTransactions(Request $request)
    {
        $request->validate([
            'year' => 'nullable|integer|digits:4',
            'month' => 'nullable|integer|between:1,12',
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date|after_or_equal:start_date',
        ]);

        $data = $this->getFilteredDetailedData(
            $request->input('year'),
            $request->input('month'),
            $request->input('start_date'),
            $request->input('end_date')
        );

        return response()->json($data);
    }

    public function exportReport(Request $request)
    {
        $request->validate([
            'type' => 'required|in:excel,pdf',
            'report_view' => 'nullable|in:new_acquisitions,problematic_assets'
        ]);

        $details = $this->getFilteredDetailedData(
            $request->input('year'),
            $request->input('month'),
            $request->input('start_date'),
            $request->input('end_date')
        );

        $fileName = 'laporan-keuangan-aset-' . date('Y-m-d');

        $period = 'Semua Waktu';
        if ($request->year) $period = $request->year;
        if ($request->month) $period = date('F', mktime(0, 0, 0, $request->month, 10)) . ' ' . $request->year;
        if ($request->start_date && $request->end_date) $period = $request->start_date . ' s/d ' . $request->end_date;

        $report_view = $request->input('report_view');

        if ($request->type === 'excel') {
            return Excel::download(new FinancialReportExport($details, $report_view), $fileName . '.xlsx');
        }

        if ($request->type === 'pdf') {
            $summary = $this->getInventoryReport($request)->getData(true);
            $pdf = PDF::loadView('reports.financial_report_pdf', compact('summary', 'details', 'period', 'report_view'));
            return $pdf->download($fileName . '.pdf');
        }
    }

    private function getFilteredDetailedData($year, $month, $startDate, $endDate)
    {
        $newAssetsQuery = StokBarang::with(['masterBarang:id_m_barang,nama_barang'])
            ->select('tanggal_pembelian', 'kode_unik', 'harga_beli', 'master_barang_id');

        if ($startDate && $endDate) {
            $newAssetsQuery->whereBetween('tanggal_pembelian', [$startDate, $endDate]);
        } else {
            if ($year) $newAssetsQuery->whereYear('tanggal_pembelian', $year);
            if ($month) $newAssetsQuery->whereMonth('tanggal_pembelian', $month);
        }

        $problematicAssetsQuery = StokBarang::with([
            'masterBarang:id_m_barang,nama_barang',
            'statusDetail:id,nama_status',
            'userPerusak:id,name',
            'userPenghilang:id,name'
        ])
            ->select('tanggal_rusak', 'tanggal_hilang', 'kode_unik', 'harga_beli', 'master_barang_id', 'status_id', 'user_perusak_id', 'user_penghilang_id');

        $problematicStatusIds = DB::table('status_barang')->whereIn('nama_status', ['Rusak', 'Hilang'])->pluck('id');
        $problematicAssetsQuery->whereIn('status_id', $problematicStatusIds);

        if ($startDate && $endDate) {
            $problematicAssetsQuery->where(function ($query) use ($startDate, $endDate) {
                $query->whereBetween('tanggal_rusak', [$startDate, $endDate])
                      ->orWhereBetween('tanggal_hilang', [$startDate, $endDate]);
            });
        } elseif ($year || $month) {
            $problematicAssetsQuery->where(function ($query) use ($year, $month) {
                $query->where(function ($subQuery) use ($year, $month) {
                    if ($year) $subQuery->whereYear('tanggal_rusak', $year);
                    if ($month) $subQuery->whereMonth('tanggal_rusak', $month);
                });
                $query->orWhere(function ($subQuery) use ($year, $month) {
                    if ($year) $subQuery->whereYear('tanggal_hilang', $year);
                    if ($month) $subQuery->whereMonth('tanggal_hilang', $month);
                });
            });
        }
        
        return [
            'new_acquisitions' => $newAssetsQuery->latest('tanggal_pembelian')->get()->toArray(),
            'problematic_assets' => $problematicAssetsQuery->orderByRaw('COALESCE(tanggal_rusak, tanggal_hilang) DESC')->get()->toArray(),
        ];
    }

    public function getFinancialChartData(Request $request)
    {
        $year = $request->input('year', now()->year);

        // 1. Ambil data total pembelian per bulan
        $newAssetsData = StokBarang::select(
            DB::raw('MONTH(tanggal_pembelian) as month'),
            DB::raw('SUM(harga_beli) as total_value')
        )
            ->whereYear('tanggal_pembelian', $year)
            ->groupBy('month')
            ->pluck('total_value', 'month')
            ->all();

        $problematicStatusIds = DB::table('status_barang')->whereIn('nama_status', ['Rusak', 'Hilang'])->pluck('id');

        // 2. Ambil data total kerugian per bulan
        $problematicAssetsData = StokBarang::whereIn('status_id', $problematicStatusIds)
            ->where(function ($query) use ($year) {
                $query->whereYear('tanggal_rusak', $year)
                    ->orWhereYear('tanggal_hilang', $year);
            })
            ->select(
                DB::raw('MONTH(COALESCE(tanggal_rusak, tanggal_hilang)) as month'),
                DB::raw('SUM(harga_beli) as total_value')
            )
            ->groupBy('month')
            ->pluck('total_value', 'month')
            ->all();

        $labels = [];
        $newValues = [];
        $problematicValues = [];

        // 3. Format data agar selalu ada 12 bulan (Jan - Des)
        for ($m = 1; $m <= 12; $m++) {
            $labels[] = date('M', mktime(0, 0, 0, $m, 1)); // Jan, Feb, Mar, ...
            $newValues[] = $newAssetsData[$m] ?? 0;
            $problematicValues[] = $problematicAssetsData[$m] ?? 0;
        }

        return response()->json([
            'labels' => $labels,
            'newAssets' => $newValues,
            'problematicAssets' => $problematicValues,
        ]);
    }
    public function getAssetComposition()
    {
        $problematicStatusIds = DB::table('status_barang')->whereIn('nama_status', ['Rusak', 'Hilang'])->pluck('id');

        $totalAssetValue = StokBarang::sum('harga_beli');
        $problematicAssetValue = StokBarang::whereIn('status_id', $problematicStatusIds)->sum('harga_beli');
        $netAssetValue = $totalAssetValue - $problematicAssetValue;

        return response()->json([
            'labels' => ['Nilai Aset Bersih', 'Potensi Kerugian'],
            'data' => [(float)$netAssetValue, (float)$problematicAssetValue]
        ]);
    }

    /**
     * Menyediakan data untuk Bar Chart Nilai Aset per Kategori.
     */
    public function getValueByCategory()
    {
        $data = StokBarang::join('master_barangs', 'stok_barangs.master_barang_id', '=', 'master_barangs.id_m_barang')
            ->join('master_kategoris', 'master_barangs.id_kategori', '=', 'master_kategoris.id_kategori')
            ->select(
                'master_kategoris.nama_kategori',
                DB::raw('SUM(stok_barangs.harga_beli) as total_value')
            )
            ->groupBy('master_kategoris.nama_kategori')
            ->orderBy('total_value', 'desc')
            ->get();

        return response()->json([
            'labels' => $data->pluck('nama_kategori'),
            'data' => $data->pluck('total_value'),
        ]);
    }
    public function getTopPurchasesByValue(Request $request)
    {
        $year = now()->year;
        $limit = 10; // Ambil 10 data teratas

        $purchases = StokBarang::with('masterBarang:id_m_barang,nama_barang')
            ->whereYear('tanggal_pembelian', $year)
            ->orderBy('harga_beli', 'desc')
            ->limit($limit)
            ->get();

        return response()->json([
            // Buat label unik dengan menyertakan kode unik
            'labels' => $purchases->map(fn($item) => $item->masterBarang->nama_barang . ' (' . $item->kode_unik . ')'),
            'data' => $purchases->pluck('harga_beli'),
        ]);
    }
}
