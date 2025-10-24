<?php

namespace App\Exports;

use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Carbon\Carbon; // <-- Tambahkan use Carbon

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
// Sesuaikan header berdasarkan tipe laporan
        switch ($this->type) {
            case 'in': // Laporan Barang Jadi Tersedia (dari History)
                return [
                    'Kode Unik',
                    'Serial Number', // <-- Tambah SN
                    'Nama Barang',
                    'Status Kejadian', // <-- Status saat jadi tersedia
                    'Tgl Jadi Tersedia', // <-- Tanggal kejadian
                    'Diubah Oleh', // <-- User yang trigger
                    'Workshop (Saat Kejadian)', // <-- Workshop saat kejadian
                ];
            case 'out': 
            case 'accountability': 
                 return [
                    'Kode Unik',
                    'Serial Number', 
                    'Nama Barang',
                    'Status Kejadian',
                    'Tgl Kejadian',
                    'Pengguna/Penanggung Jawab', 
                    'Workshop (Saat Kejadian)', 
                 ];
            case 'available':
                return [
                    'Kode Unik',
                    'Serial Number', 
                    'Nama Barang',
                    'Status',
                    'Tgl Masuk Awal',
                    'Ditambahkan Oleh',
                    'Kondisi',
                    'Harga Beli',
                ];
            case 'active_loans':
                return [
                    'Kode Unik',
                    'Serial Number',
                    'Nama Barang',
                    'Status',
                    'Peminjam',
                    'Lokasi',
                    'Tgl Pinjam/Keluar',
                ];
            case 'all_stock':
                return [
                    'Kode Unik',
                    'Serial Number',
                    'Nama Barang',
                    'Status Saat Ini',
                    'Lokasi/Pengguna Terakhir',
                    'Tgl Masuk Awal',
                ];
            default:
                return [];
        }
    }

    public function map($item): array
    {
        switch ($this->type) {
            case 'in':
                $stokInfo = $item->stokBarang; 
                $historyDate = $item->event_date ?? $item->created_at;
                return [
                    $stokInfo->kode_unik ?? '-',
                    $stokInfo->serial_number ?? '-',
                    $stokInfo->masterBarang->nama_barang ?? '-',
                    $item->statusDetail->nama_status ?? '-', 
                    $historyDate ? Carbon::parse($historyDate)->format('d M Y H:i') : '-', 
                    $item->triggeredByUser->name ?? '-', 
                    $item->workshop->name ?? '-',
                ];
            case 'out':
            case 'accountability': 
                $stokInfo = $item->stokBarang;
                $historyDate = $item->event_date ?? $item->created_at;
                $responsibleUser = $item->relatedUser->name ?? $item->triggeredByUser->name ?? '-';
                return [
                    $stokInfo->kode_unik ?? '-',
                    $stokInfo->serial_number ?? '-', 
                    $stokInfo->masterBarang->nama_barang ?? '-',
                    $item->statusDetail->nama_status ?? '-', 
                    $historyDate ? Carbon::parse($historyDate)->format('d M Y H:i') : '-', 
                    $responsibleUser,
                    $item->workshop->name ?? '-', 
                    $item->deskripsi ?? '-',
                ];
            case 'available':
                return [
                    $item->kode_unik,
                    $item->serial_number ?? '-',
                    $item->masterBarang->nama_barang ?? '-',
                    $item->statusDetail->nama_status ?? '-', 
                    $item->tanggal_masuk ? Carbon::parse($item->tanggal_masuk)->format('d M Y') : '-', 
                    $item->createdBy->name ?? '-',
                    $item->kondisi ?? '-',
                    $item->harga_beli ?? '-',
                ];
            case 'active_loans':
                return [
                    $item->kode_unik,
                    $item->serial_number ?? '-', 
                    $item->masterBarang->nama_barang ?? '-',
                    $item->statusDetail->nama_status ?? '-', 
                    $item->userPeminjam->name ?? '-',
                    $item->workshop->name ?? '-',
                    $item->tanggal_keluar ? Carbon::parse($item->tanggal_keluar)->format('d M Y') : '-', 
                ];
            case 'all_stock':
                return [
                    $item->kode_unik,
                    $item->serial_number ?? '-', 
                    $item->masterBarang->nama_barang ?? '-',
                    $item->statusDetail->nama_status ?? '-', 
                    $item->userPeminjam->name ?? $item->workshop->name ?? ($item->statusDetail->nama_status == 'Tersedia' ? 'Stok Gudang' : '-'),
                    $item->tanggal_masuk ? Carbon::parse($item->tanggal_masuk)->format('d M Y') : '-',
                ];
            default:
                return [];
        }
    }
    private function getResponsiblePerson($item)
    {
        if (!$item->statusDetail) {
            return '-';
        }

        switch ($item->statusDetail->nama_status) {
            case 'Digunakan':
            case 'Dipinjam':
                return $item->userPeminjam->name ?? $item->workshop->name ?? '-';
            case 'Rusak':
                return $item->userPerusak->name ?? '-';
            case 'Hilang':
                return $item->userPenghilang->name ?? '-';
            case 'Perbaikan':
                return $item->teknisiPerbaikan->name ?? '-';
            default:
                return '-';
        }
    }
}
