<?php

namespace App\Exports;

use Illuminate\Support\Collection;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;

class FinancialReportExport implements FromCollection, WithHeadings, WithMapping
{
    protected $data;

    public function __construct(array $data, ?string $reportView)
    {
        $newAcquisitions = collect();
        $problematicAssets = collect();

        if (empty($reportView) || $reportView === 'new_acquisitions') {
            $newAcquisitions = collect($data['new_acquisitions'])->map(function ($item) {
                $item['type'] = 'Pembelian Baru (Aset Masuk)';
                return $item;
            });
        }
        
        if (empty($reportView) || $reportView === 'problematic_assets') {
            $problematicAssets = collect($data['problematic_assets'])->map(function ($item) {
                $item['type'] = 'Potensi Kerugian (Rusak/Hilang)';
                return $item;
            });
        }

        $this->data = $newAcquisitions->concat($problematicAssets);
    }

    public function collection()
    {
        return $this->data;
    }

    public function headings(): array
    {
        return [
            'Tanggal',
            'Tipe Transaksi',
            'Kode Unik',
            'Nama Barang',
            'Nilai',
        ];
    }

    
        public function map($item): array
    {
        return [
            $item['tanggal_pembelian'] ?? $item['tanggal_rusak'] ?? $item['tanggal_hilang'] ?? 'N/A',
            $item['type'],
            $item['kode_unik'],
            $item['master_barang']['nama_barang'] ?? 'N/A',
            (float) $item['harga_beli'],
        ];
    }
}