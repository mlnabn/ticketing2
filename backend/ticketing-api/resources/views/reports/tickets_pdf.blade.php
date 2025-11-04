<!DOCTYPE html>
<html>

<head>
    <title>Laporan Tiket</title>
    <style>
        body {
            font-family: sans-serif;
            font-size: 9px;
        }

        /* Ukuran font sedikit dikecilkan agar muat */
        .table {
            width: 100%;
            border-collapse: collapse;
        }

        .table th,
        .table td {
            border: 1px solid #ddd;
            padding: 5px;
            text-align: left;
        }

        .table th {
            background-color: #f2f2f2;
        }

        .header {
            text-align: center;
            margin-bottom: 20px;
        }

        .header h2 {
            margin: 0;
        }
    </style>
</head>

<body>
    <div class="header">
        <h2>{{ $title ?? 'Laporan Seluruh Tiket' }}</h2>
        <p>Tanggal Laporan: {{ date('d F Y') }}</p>
    </div>

    <table class="table">
        <thead>
            <tr>
                <th>Kode</th>
                <th>Judul</th>
                <th>Status</th>
                <th>Workshop</th>
                <th>Admin</th>
                <th>Pembuat</th>
                <th>Tgl Dibuat</th>
                <th>Tgl Mulai</th>
                <th>Tgl Selesai</th>
                <th>Durasi</th>
            </tr>
        </thead>
        <tbody>
            @forelse ($tickets as $ticket)
            <tr>
                <td>{{ $ticket->kode_tiket ?? '-' }}</td>
                <td>{{ \Illuminate\Support\Str::limit($ticket->title, 50, '...') }}</td>
                <td>{{ $ticket->status }}</td>
                <td>
                    @php
                        $workshopName = null;
                        
                        // 1. Cek relasi yang sudah di-load (seperti di TicketsExport)
                        if ($ticket->relationLoaded('workshop') && $ticket->workshop) {
                            $workshopName = $ticket->workshop->name;
                        } 
                        
                        // 2. Fallback: Jika relasi tidak ada TAPI workshop_id ada, query manual
                        // Ini persis seperti logika di TicketsExport.php
                        if (!$workshopName && $ticket->workshop_id) {
                            // Gunakan full namespace (\App\Models\Workshop) karena ini file Blade
                            $ws = \App\Models\Workshop::find($ticket->workshop_id);
                            $workshopName = $ws ? $ws->name : null;
                        }
                        
                        // 3. Tampilkan hasil atau default '-' (e() berfungsi sama seperti {{ }})
                        echo e($workshopName ?: '-');
                    @endphp
                </td>
                <td>{{ $ticket->user->name ?? 'N/A' }}</td>
                <td>{{ $ticket->creator->name ?? 'N/A' }}</td>
                <td>{{ $ticket->created_at ? \Carbon\Carbon::parse($ticket->created_at)->format('d-m-y H:i') : '-' }}</td>
                <td>{{ $ticket->started_at ? \Carbon\Carbon::parse($ticket->started_at)->format('d-m-y H:i') : '-' }}</td>
                <td>{{ $ticket->completed_at ? \Carbon\Carbon::parse($ticket->completed_at)->format('d-m-y H:i') : '-' }}</td>

                <td>
                    @php
                    $durationText = 'N/A';
                    if ($ticket->started_at && $ticket->completed_at) {
                    $start = \Carbon\Carbon::parse($ticket->started_at);
                    $end = \Carbon\Carbon::parse($ticket->completed_at);
                    $diffInSeconds = $end->timestamp - $start->timestamp;

                    if ($diffInSeconds >= 0) {
                    $totalMinutes = floor($diffInSeconds / 60);
                    if ($totalMinutes < 60) {
                        $durationText="{$totalMinutes} mnt" ;
                        } else {
                        $hours=floor($totalMinutes / 60);
                        $minutes=$totalMinutes % 60;
                        $durationText="{$hours} j {$minutes} mnt" ;
                        }
                        } else {
                        $durationText="0 mnt" ;
                        }
                        }
                        @endphp
                        {{ $durationText }}
                        </td>
            </tr>
            @empty
            <tr>
                <td colspan="10" style="text-align: center;">Tidak ada data tiket.</td>
            </tr>
            @endforelse
        </tbody>
    </table>
</body>

</html>