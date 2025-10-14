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
        return [
            'Kode Unik',
            'Nama Barang',
            'Status',
            $this->type === 'in' ? 'Tanggal Masuk' : 'Tanggal Keluar',
            'Penanggung Jawab',
            'Workshop',
            'Kondisi',
            'Harga Beli',
            'Serial Number',
        ];
    }

    public function map($item): array
    {
        $penanggungJawab = '-';
        if ($this->type === 'in') {
            $penanggungJawab = $item->createdBy->name ?? '-';
        } else {
            $penanggungJawab = $item->userPeminjam->name ?? $item->userPerusak->name ?? $item->userPenghilang->name ?? '-';
        }

        return [
            $item->kode_unik,
            $item->masterBarang->nama_barang ?? '-',
            $item->statusDetail->nama_status ?? '-',
            $this->type === 'in' ? ($item->tanggal_masuk ? \Carbon\Carbon::parse($item->tanggal_masuk)->format('d M Y') : '-') : ($item->tanggal_keluar ? \Carbon\Carbon::parse($item->tanggal_keluar)->format('d M Y') : '-'),
            $penanggungJawab,
            $item->workshop->name ?? '-',
            $item->kondisi,
            $item->harga_beli,
            $item->serial_number ?? '-',
        ];
    }
}
