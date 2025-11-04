<?php

namespace App\Exports;

use App\Models\Ticket;
use App\Models\Workshop;
use Illuminate\Support\Collection;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Illuminate\Support\Str;

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
            'Durasi Pengerjaan', 
        ];
    }

    /**
     * @param Ticket $ticket
     * @return array
     */
    public function map($ticket): array
    {
        $workshopName = null;

        if ($ticket->relationLoaded('workshop') && $ticket->workshop) {
            $workshopName = $ticket->workshop->name ?? null;
        }

        // 2) Jika relasi tidak ada atau belum di-load, fallback ambil langsung dari DB
        if (!$workshopName && $ticket->workshop_id) {
            $ws = Workshop::find($ticket->workshop_id);
            $workshopName = $ws ? $ws->name : null;
        }

        // 3) Default tampilan bila kosong
        $workshopName = $workshopName ?: '-';

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
            Str::limit($ticket->title, 50, '...'),
            $ticket->status,
            $workshopName,
            $ticket->user->name ?? 'N/A',
            $ticket->creator->name ?? 'N/A',
            $ticket->created_at ? \Carbon\Carbon::parse($ticket->created_at)->format('d-m-Y H:i') : '-',
            $ticket->started_at ? \Carbon\Carbon::parse($ticket->started_at)->format('d-m-Y H:i') : '-',
            $ticket->completed_at ? \Carbon\Carbon::parse($ticket->completed_at)->format('d-m-Y H:i') : '-',
            $durationText, // <- Gunakan hasil format teks
        ];
    }
}
