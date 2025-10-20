<!DOCTYPE html>
<html>

<head>
    <meta charset="utf-8">
    <title>{{ $title }}</title>
    <style>
        body {
            font-family: 'Helvetica', sans-serif;
            color: #333;
        }

        .header h1 {
            text-align: center;
            margin: 0;
            font-size: 24px;
        }

        .header p {
            text-align: center;
            margin: 5px 0 20px;
            font-size: 12px;
            color: #777;
        }

        table {
            width: 100%;
            border-collapse: collapse;
        }

        th,
        td {
            border: 1px solid #dddddd;
            text-align: left;
            padding: 8px;
            font-size: 10px;
        }

        th {
            background-color: #f2f2f2;
            font-weight: bold;
        }

        tbody tr:nth-child(even) {
            background-color: #f9f9f9;
        }
    </style>
</head>

<body>
    <div class="header">
        <h1>{{ $title }}</h1>
        <p>Dicetak pada: {{ now()->format('d F Y, H:i') }}</p>
    </div>

    <table>
        <thead>
            <tr>
                {{-- [MODIFIKASI] Logika untuk header tabel --}}
                @if($type === 'active_loans')
                <th>Kode Unik</th>
                <th>Nama Barang</th>
                <th>Status</th>
                <th>Peminjam</th>
                <th>Lokasi</th>
                <th>Tgl Pinjam</th>
                @elseif($type === 'all_stock')
                <th>Kode Unik</th>
                <th>Nama Barang</th>
                <th>Status Saat Ini</th>
                <th>Lokasi/Pengguna Terakhir</th>
                @else
                <th>Kode Unik</th>
                <th>Nama Barang</th>
                <th>Status</th>
                <th>{{ $type === 'in' ? 'Tgl Masuk' : 'Tgl Keluar' }}</th>
                <th>Penanggung Jawab</th>
                <th>Workshop</th>
                @endif
            </tr>
        </thead>
        <tbody>
            @forelse($data as $item)
            <tr>
                {{-- [MODIFIKASI] Logika untuk data baris --}}
                @if($type === 'active_loans')
                <td>{{ $item->kode_unik }}</td>
                <td>{{ $item->masterBarang->nama_barang ?? '-' }}</td>
                <td>{{ $item->statusDetail->nama_status ?? '-' }}</td>
                <td>{{ $item->userPeminjam->name ?? '-' }}</td>
                <td>{{ $item->workshop->name ?? '-' }}</td>
                <td>{{ $item->tanggal_keluar ? \Carbon\Carbon::parse($item->tanggal_keluar)->format('d M Y') : '-' }}</td>
                @elseif($type === 'all_stock')
                <td>{{ $item->kode_unik }}</td>
                <td>{{ $item->masterBarang->nama_barang ?? '-' }}</td>
                <td>{{ $item->statusDetail->nama_status ?? '-' }}</td>
                <td>{{ $item->userPeminjam->name ?? $item->workshop->name ?? '-' }}</td>
                @else
                <td>{{ $item->kode_unik }}</td>
                <td>{{ $item->masterBarang->nama_barang ?? '-' }}</td>
                <td>{{ $item->statusDetail->nama_status ?? '-' }}</td>
                <td>
                    @if($type === 'in')
                    {{ $item->tanggal_masuk ? \Carbon\Carbon::parse($item->tanggal_masuk)->format('d M Y') : '-' }}
                    @else
                    {{ $item->tanggal_keluar ? \Carbon\Carbon::parse($item->tanggal_keluar)->format('d M Y') : '-' }}
                    @endif
                </td>
                <td>
                    @if($type === 'in')
                    {{ $item->createdBy->name ?? '-' }}
                    @else
                    {{ $item->userPeminjam->name ?? $item->userPerusak->name ?? $item->userPenghilang->name ?? '-' }}
                    @endif
                </td>
                <td>{{ $item->workshop->name ?? '-' }}</td>
                @endif
            </tr>
            @empty
            <tr>
                {{-- [MODIFIKASI] Menyesuaikan colspan --}}
                @if($type === 'active_loans')
                <td colspan="6" style="text-align: center;">Tidak ada data yang sesuai dengan filter.</td>
                @elseif($type === 'all_stock')
                <td colspan="4" style="text-align: center;">Tidak ada data yang sesuai dengan filter.</td>
                @else
                <td colspan="6" style="text-align: center;">Tidak ada data yang sesuai dengan filter.</td>
                @endif
            </tr>
            @endforelse
        </tbody>
    </table>
</body>

</html>