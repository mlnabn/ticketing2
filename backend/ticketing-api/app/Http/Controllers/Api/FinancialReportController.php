<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\StokBarang;
use Illuminate\Support\Facades\DB;
use App\Exports\FinancialReportExport; 
use Maatwebsite\Excel\Facades\Excel; 
use PDF;

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
        
        $problematicStatusIds = DB::table('status_barang')->whereIn('nama_status', ['Rusak', 'Hilang'])->pluck('id');

        // Lakukan perhitungan
        $newAssetValue = $newAssetsQuery->sum('harga_beli');
        $totalAssetValue = $cumulativeAssetsQuery->sum('harga_beli');
        $problematicAssetValue = (clone $cumulativeAssetsQuery)->whereIn('status_id', $problematicStatusIds)->sum('harga_beli');

        return response()->json([
            'new_asset_value' => (float) $newAssetValue,
            'total_asset_value' => (float) $totalAssetValue,
            'problematic_asset_value' => (float) $problematicAssetValue,
            'net_asset_value' => (float) ($totalAssetValue - $problematicAssetValue),
        ]);
    }

    public function getDetailedTransactions(Request $request)
    {
        // Validasi filter (sama seperti sebelumnya)
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

        // --- Query untuk Aset Baru (Pembelian pada periode terpilih) ---
        $newAssetsQuery = StokBarang::with(['masterBarang:id_m_barang,nama_barang'])
            ->select('tanggal_pembelian', 'kode_unik', 'harga_beli', 'master_barang_id');
        
        if ($startDate && $endDate) {
            $newAssetsQuery->whereBetween('tanggal_pembelian', [$startDate, $endDate]);
        } else {
            if ($year) $newAssetsQuery->whereYear('tanggal_pembelian', $year);
            if ($month) $newAssetsQuery->whereMonth('tanggal_pembelian', $month);
        }

        // --- Query untuk Aset Bermasalah (Hingga akhir periode terpilih) ---
        $problematicAssetsQuery = StokBarang::with([
                'masterBarang:id_m_barang,nama_barang',
                'statusDetail:id,nama_status', // <-- TAMBAHKAN: Ambil nama status
                'userPerusak:id,name',         // <-- TAMBAHKAN: Ambil nama user perusak
                'userPenghilang:id,name'       // <-- TAMBAHKAN: Ambil nama user penghilang
            ])
            ->select('tanggal_rusak', 'tanggal_hilang', 'kode_unik', 'harga_beli', 'master_barang_id', 'status_id', 'user_perusak_id', 'user_penghilang_id'); // <-- TAMBAHKAN kolom foreign key
            
        $problematicStatusIds = DB::table('status_barang')->whereIn('nama_status', ['Rusak', 'Hilang'])->pluck('id');
        $problematicAssetsQuery->whereIn('status_id', $problematicStatusIds);
        
        if ($startDate && $endDate) {
            $problematicAssetsQuery->where(function ($query) use ($startDate, $endDate) {
                $query->whereBetween('tanggal_rusak', [$startDate, $endDate])
                    ->orWhereBetween('tanggal_hilang', [$startDate, $endDate]);
            });
        } else {
            $problematicAssetsQuery->where(function ($query) use ($year, $month) {
                $query->where(function ($subQuery) use ($year, $month) {
                    if ($year) $subQuery->whereYear('tanggal_rusak', $year);
                    if ($month) $subQuery->whereMonth('tanggal_rusak', $month);
                })
                ->orWhere(function ($subQuery) use ($year, $month) {
                    if ($year) $subQuery->whereYear('tanggal_hilang', $year);
                    if ($month) $subQuery->whereMonth('tanggal_hilang', $month);
                });
            });
        }
        
        return response()->json([
            'new_acquisitions' => $newAssetsQuery->latest('tanggal_pembelian')->get(),
            'problematic_assets' => $problematicAssetsQuery->latest('tanggal_pembelian')->get(),
        ]);
    }

    public function exportReport(Request $request)
    {
        $request->validate([ 'type' => 'required|in:excel,pdf' ]);
        
        // Panggil fungsi yang sudah ada untuk mendapatkan data
        $summary = $this->getInventoryReport($request)->getData(true);
        $details = $this->getDetailedTransactions($request)->getData(true);

        $fileName = 'laporan-keuangan-aset-' . date('Y-m-d');
        
        // Menentukan teks periode untuk judul PDF
        $period = 'Semua Waktu';
        if($request->year) $period = $request->year;
        if($request->month) $period = date('F', mktime(0, 0, 0, $request->month, 10)) . ' ' . $request->year;
        if($request->start_date && $request->end_date) $period = $request->start_date . ' s/d ' . $request->end_date;

        if ($request->type === 'excel') {
            return Excel::download(new FinancialReportExport($details), $fileName . '.xlsx');
        }

        if ($request->type === 'pdf') {
            $pdf = PDF::loadView('reports.financial_report_pdf', compact('summary', 'details', 'period'));
            return $pdf->download($fileName . '.pdf');
        }
    }
}