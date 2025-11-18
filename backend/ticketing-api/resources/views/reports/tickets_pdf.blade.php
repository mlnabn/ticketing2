<!DOCTYPE html>
<html>

<head>
    <title>{{ $title ?? 'Laporan Seluruh Tiket' }}</title>
    <style>
        /* Menggunakan font yang umum dan ukuran yang disesuaikan untuk PDF */
        body {
            font-family: 'Helvetica', sans-serif;
            font-size: 9px;
        }

        /* Styling Tabel */
        .table {
            width: 100%;
            border-collapse: collapse;
            table-layout: fixed;
        }

        /* Padding dan border disesuaikan agar rapi */
        .table th,
        .table td {
            border: 1px solid #ddd;
            padding: 5px;
            text-align: left;
            word-wrap: break-word;
            /* Penting agar judul panjang tidak merusak layout */
            vertical-align: top;
        }

        .table th {
            background-color: #f2f2f2;
            font-size: 10px;
            text-align: center;
        }

        /* Styling Header */
        .header {
            text-align: center;
            margin-bottom: 20px;
        }

        .header h2 {
            margin: 0;
            font-size: 16px;
        }

        .header p {
            margin: 5px 0;
            font-size: 11px;
        }

        /* Pengaturan lebar kolom untuk A4 Landscape (10 kolom) */
        .table .col-kode {
            width: 7%;
        }

        .table .col-judul {
            width: 23%;
        }

        .table .col-status {
            width: 8%;
        }

        .table .col-workshop {
            width: 10%;
        }

        .table .col-admin {
            width: 10%;
        }

        .table .col-creator {
            width: 10%;
        }

        .table .col-date {
            width: 9%;
        }

        /* Tgl dibuat */
        .table .col-date-start {
            width: 9%;
        }

        /* Tgl mulai */
        .table .col-date-end {
            width: 9%;
        }

        /* Tgl selesai */
        .table .col-duration {
            width: 5%;
        }
    </style>
</head>

<body>
    <div class="header">
        <h2>{{ $title ?? 'Laporan Seluruh Tiket' }}</h2>
        <p>Tanggal Laporan: {{ date('d F Y, H:i') }}</p>
    </div>

    <table class="table">
        <thead>
            <tr>
                <th class="col-kode">Kode</th>
                <th class="col-judul">Judul/Masalah</th>
                <th class="col-status">Status</th>
                <th class="col-workshop">Workshop</th>
                <th class="col-admin">Admin</th>
                <th class="col-creator">Pembuat</th>
                <th class="col-date">Dibuat</th>
                <th class="col-date-start">Mulai</th>
                <th class="col-date-end">Selesai</th>
                <th class="col-duration">Durasi</th>
            </tr>
        </thead>
        <tbody>
            @forelse ($tickets as $ticket)
            <tr>
                <td>{{ $ticket->kode_tiket ?? '-' }}</td>
                {{-- Membatasi judul agar tidak terlalu panjang dan merusak tata letak --}}
                <td>{{ \Illuminate\Support\Str::limit($ticket->title, 50, '...') }}</td>
                <td>{{ $ticket->status }}</td>
                <td>
                    @php
                    // Cek workshop name dari relasi yang sudah di-load di controller
                    $workshopName = $ticket->workshop?->name ?? null;

                    // Fallback: Query manual jika ID ada dan relasi gagal (pastikan Workshop Model ada)
                    if (!$workshopName && $ticket->workshop_id) {
                    try {
                    $ws = \App\Models\Workshop::find($ticket->workshop_id);
                    $workshopName = $ws ? $ws->name : null;
                    } catch (\Exception $e) {
                    $workshopName = null;
                    }
                    }

                    echo e($workshopName ?: '-');
                    @endphp
                </td>
                {{-- Menggunakan operator nullsafe (?->) --}}
                <td>{{ $ticket->user?->name ?? 'N/A' }}</td>
                <td>{{ $ticket->creator?->name ?? 'N/A' }}</td>
                {{-- Format Tanggal: d-m-y H:i agar lebih ringkas --}}
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
                <td colspan="10" style="text-align: center;">Tidak ada data tiket yang tersedia untuk filter ini.</td>
            </tr>
            @endforelse
        </tbody>
    </table>
</body>

</html>