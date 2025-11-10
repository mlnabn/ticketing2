<?php

namespace App\Exports;

use App\Models\PurchaseProposal; 
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use Maatwebsite\Excel\Concerns\WithColumnFormatting; 
use Maatwebsite\Excel\Concerns\WithStyles; 
use PhpOffice\PhpSpreadsheet\Style\NumberFormat; 
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

class PurchaseProposalExport implements FromCollection, WithHeadings, WithMapping, ShouldAutoSize, WithColumnFormatting, WithStyles
{
    protected $proposal;
    protected $itemsCount;

    public function __construct(PurchaseProposal $proposal)
    {
        $this->proposal = $proposal;
        $this->itemsCount = $proposal->items->count(); 
    }

    public function collection()
    {
        return $this->proposal->items;
    }

    public function headings(): array
    {
        return [
            'Nama Barang',
            'Kategori',
            'Sub-Kategori',
            'Jumlah',
            'Estimasi Harga Satuan',
            'Total Estimasi Harga',
            'Keterangan',
            'Link',
        ];
    }

    public function map($item): array
    {
        $masterBarang = $item->masterBarang;
        $kategori = $masterBarang->masterKategori->nama_kategori ?? 'N/A';
        $subKategori = $masterBarang->subKategori->nama_sub ?? 'N/A';
        $totalHarga = $item->quantity * $item->estimated_price;

        return [
            $masterBarang->nama_barang,
            $kategori,
            $subKategori,
            $item->quantity,
            (float) $item->estimated_price,
            (float) $totalHarga,
            $item->notes,
            $item->link,
        ];
    }

    /**
     * @return array
     * Fungsi ini memformat kolom E dan F sebagai Rupiah.
     */
    public function columnFormats(): array
    {
        $rpFormat = '"Rp"#,##0';
        return [
            'E' => $rpFormat,
            'F' => $rpFormat,
        ];
    }

    /**
     * @param Worksheet $sheet
     * Fungsi ini menambahkan baris TOTAL di akhir dan membuatnya BOLD.
     */
    public function styles(Worksheet $sheet)
    {
        $totalRowNumber = 1 + $this->itemsCount + 1;
        $sheet->setCellValue("E{$totalRowNumber}", 'TOTAL ESTIMASI KESELURUHAN');
        $sheet->setCellValue("F{$totalRowNumber}", (float) $this->proposal->total_estimated_cost);

        return [
            1    => ['font' => ['bold' => true]],
            $totalRowNumber => [
                'font' => ['bold' => true],
                'borders' => [
                    'top' => [
                        'borderStyle' => \PhpOffice\PhpSpreadsheet\Style\Border::BORDER_THIN,
                    ],
                ],
            ],
        ];
    }
}