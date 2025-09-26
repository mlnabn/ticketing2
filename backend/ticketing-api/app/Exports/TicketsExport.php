<?php

namespace App\Exports;

use App\Models\Ticket;
use Illuminate\Support\Collection;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;

class TicketsExport implements FromCollection, WithHeadings, WithMapping
{
    protected $tickets;

    public function __construct(Collection $tickets)
    {
        $this->tickets = $tickets;
    }

    /**
     * @return \Illuminate\Support\Collection
     */
    public function collection()
    {
        return $this->tickets;
    }

    /**
     * @return array
     */
    public function headings(): array
    {
        return [
            'Kode Tiket',
            'Judul',
            'Status',
            'Workshop',
            'Admin Pengerja',
            'Pembuat',
            'Tanggal Dibuat',
            'Tanggal Mulai',
            'Tanggal Selesai',
            'Durasi Pengerjaan', // <- Judul diubah di sini
        ];
    }

    /**
     * @param Ticket $ticket
     * @return array
     */
    public function map($ticket): array
    {
        $durationText = 'N/A'; // Default value diubah menjadi teks

        if ($ticket->started_at && $ticket->completed_at) {
            $start = \Carbon\Carbon::parse($ticket->started_at);
            $end = \Carbon\Carbon::parse($ticket->completed_at);
            $diffInSeconds = $end->timestamp - $start->timestamp;

            if ($diffInSeconds >= 0) {
                $totalMinutes = floor($diffInSeconds / 60);
                
                // (BARU) Logika untuk mengubah total menit menjadi format jam dan menit
                if ($totalMinutes < 60) {
                    $durationText = "{$totalMinutes} menit";
                } else {
                    $hours = floor($totalMinutes / 60);
                    $minutes = $totalMinutes % 60;
                    $durationText = "{$hours} jam {$minutes} menit";
                }
            } else {
                $durationText = "0 menit"; // Jika negatif, anggap 0
            }
        }

        return [
            $ticket->kode_tiket ?? '-',
            $ticket->title,
            $ticket->status,
            $ticket->workshop ?? '-',
            $ticket->user->name ?? 'N/A',
            $ticket->creator->name ?? 'N/A',
            $ticket->created_at ? \Carbon\Carbon::parse($ticket->created_at)->format('d-m-Y H:i') : '-',
            $ticket->started_at ? \Carbon\Carbon::parse($ticket->started_at)->format('d-m-Y H:i') : '-',
            $ticket->completed_at ? \Carbon\Carbon::parse($ticket->completed_at)->format('d-m-Y H:i') : '-',
            $durationText, // <- Gunakan hasil format teks
        ];
    }
}
