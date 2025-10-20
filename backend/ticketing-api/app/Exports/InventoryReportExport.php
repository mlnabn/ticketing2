<?php

namespace App\Exports;

use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;

class InventoryReportExport implements FromCollection, WithHeadings, WithMapping
{
    protected $data;
    protected $type;

    public function __construct($data, $type)
    {
        $this->data = $data;
        $this->type = $type;
    }

    public function collection()
    {
        return $this->data;
    }

    public function headings(): array
    {
        
        switch ($this->type) {
            case 'in':
                return [
                    'Kode Unik',
                    'Nama Barang',
                    'Status',
                    'Tanggal Masuk',
                    'Penanggung Jawab',
                    'Workshop',
                    'Kondisi',
                    'Harga Beli',
                    'Serial Number',
                ];
            case 'out':
                 return [
                    'Kode Unik',
                    'Nama Barang',
                    'Status',
                    'Tanggal Keluar',
                    'Penanggung Jawab',
                    'Workshop',
                    'Kondisi',
                    'Harga Beli',
                    'Serial Number',
                ];
            case 'active_loans':
                return [
                    'Kode Unik',
                    'Nama Barang',
                    'Status',
                    'Peminjam',
                    'Lokasi',
                    'Tgl Pinjam',
                ];
            case 'all_stock': 
                return [
                    'Kode Unik',
                    'Nama Barang',
                    'Status Saat Ini',
                    'Lokasi/Pengguna Terakhir',
                ];
            default:
                return [];
        }
    }

    public function map($item): array
    {
        switch ($this->type) {
            case 'in':
                return [
                    $item->kode_unik,
                    $item->masterBarang->nama_barang ?? '-',
                    $item->statusDetail->nama_status ?? '-',
                    $item->tanggal_masuk ? \Carbon\Carbon::parse($item->tanggal_masuk)->format('d M Y') : '-',
                    $item->createdBy->name ?? '-',
                    $item->workshop->name ?? '-',
                    $item->kondisi,
                    $item->harga_beli,
                    $item->serial_number ?? '-',
                ];
            case 'out':
                return [
                    $item->kode_unik,
                    $item->masterBarang->nama_barang ?? '-',
                    $item->statusDetail->nama_status ?? '-',
                    $item->tanggal_keluar ? \Carbon\Carbon::parse($item->tanggal_keluar)->format('d M Y') : '-',
                    $item->userPeminjam->name ?? $item->userPerusak->name ?? $item->userPenghilang->name ?? '-',
                    $item->workshop->name ?? '-',
                    $item->kondisi,
                    $item->harga_beli,
                    $item->serial_number ?? '-',
                ];
            case 'active_loans': 
                return [
                    $item->kode_unik,
                    $item->masterBarang->nama_barang ?? '-',
                    $item->statusDetail->nama_status ?? '-',
                    $item->userPeminjam->name ?? '-',
                    $item->workshop->name ?? '-',
                    $item->tanggal_keluar ? \Carbon\Carbon::parse($item->tanggal_keluar)->format('d M Y') : '-',
                ];
            case 'all_stock': 
                 return [
                    $item->kode_unik,
                    $item->masterBarang->nama_barang ?? '-',
                    $item->statusDetail->nama_status ?? '-',
                    $item->userPeminjam->name ?? $item->workshop->name ?? '-',
                ];
            default:
                return [];
        }
    }
}