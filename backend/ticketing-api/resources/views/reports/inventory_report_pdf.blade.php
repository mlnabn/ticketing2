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
            font-size: 18px;
        }

        .header p {
            text-align: center;
            margin: 5px 0 15px;
            font-size: 11px;
            color: #777;
        }

        table {
            width: 100%;
            border-collapse: collapse;
        }

        th,
        td {
            border: 1px solid #ddd;
            text-align: left;
            padding: 6px;
            font-size: 9px;
            vertical-align: top;
            word-wrap: break-word;
        }

        th {
            background-color: #f2f2f2;
            font-weight: bold;
        }

        tbody tr:nth-child(even) {
            background-color: #f9f9f9;
        }

        .text-center {
            text-align: center;
        }

        .text-right {
            text-align: right;
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
                @php
                $isHistoryBased = in_array($type, ['in', 'out', 'accountability', 'item_history']);
                @endphp
                <th>Kode Unik</th>
                <th>Serial Number</th>
                <th>Nama Barang</th>
                @if($type === 'in' || $type === 'out')
                    <th>Status Dari</th>
                    <th>Status Perubahan</th>
                @else
                    <th>
                        @if($isHistoryBased) Status Kejadian
                        @elseif($type === 'active_loans') Status
                        @elseif($type === 'available') Status
                        @elseif($type === 'all_stock') Status Saat Ini
                        @else Status @endif
                    </th>
                @endif
                <th>
                    @if($type === 'in') Tgl Jadi Tersedia
                    @elseif($type === 'out' || $type === 'accountability') Tgl Kejadian
                    @elseif($type === 'active_loans') Tgl Pinjam/Keluar
                    @elseif($type === 'available' || $type === 'all_stock') Tgl Masuk Awal
                    @else Tanggal @endif
                </th>
                <th>
                    @if($type === 'in') Diubah Oleh
                    @elseif($type === 'out' || $type === 'accountability') Pengguna/PJawab
                    @elseif($type === 'active_loans') Peminjam
                    @elseif($type === 'available') Ditambahkan Oleh
                    @elseif($type === 'all_stock') Lokasi/Pengguna
                    @else Penanggung Jawab @endif
                </th>
                @if(!in_array($type, ['in', 'accountability', 'available']))
                <th>
                    @if($isHistoryBased) Workshop (Saat Kejadian)
                    @elseif($type === 'active_loans') Lokasi Peminjaman
                    @else Workshop @endif
                </th>
                @endif
                @if($type === 'out' || $type === 'accountability' || $type === 'item_history')<th>Deskripsi</th>@endif
            </tr>
        </thead>
        <tbody>
            @forelse($data as $item)
            @php
            $kodeUnik = '-'; $serialNumber = '-'; $namaBarang = '-'; $displayStatus = '-';
            $relevantDate = null; $responsiblePerson = '-'; $workshopName = '-'; $deskripsi = '-';
            $previousDisplayStatus = '-';
            $isHistoryBased = in_array($type, ['in', 'out', 'accountability', 'item_history']);

            if ($isHistoryBased) {
            $stokInfo = $item->stokBarang ?? $item->stok ?? null;
            $masterInfo = $stokInfo->masterBarang ?? null;
            $kodeUnik = $stokInfo->kode_unik ?? '-';
            $serialNumber = $stokInfo->serial_number ?? '-';
            $namaBarang = $masterInfo->nama_barang ?? '-';
            $displayStatus = $item->statusDetail->nama_status ?? 'N/A';
            $relevantDate = $item->event_date ?? $item->created_at;

            if ($type === 'in') {
                $responsiblePerson = $item->triggeredByUser->name ?? '-';
                $previousDisplayStatus = $item->previousStatusDetail->nama_status ?? '-';
            
            } elseif ($type === 'out') {
                $responsiblePerson = $item->triggeredByUser->name ?? '-';
                $previousDisplayStatus = $item->previousStatusDetail->nama_status ?? '-';
                $deskripsi = $item->deskripsi ?? '-'; // <-- PINDAHKAN KE SINI

            } elseif ($type === 'accountability' || $type === 'item_history') {
                $responsiblePerson = $item->relatedUser->name ?? $item->triggeredByUser->name ?? '-';
                $deskripsi = $item->deskripsi ?? '-';
            }
            $workshopName = $item->workshop->name ?? '-';

            } else {
            $stokInfo = $item;
            $masterInfo = $stokInfo->masterBarang ?? null;
            $kodeUnik = $stokInfo->kode_unik ?? '-';
            $serialNumber = $stokInfo->serial_number ?? '-';
            $namaBarang = $masterInfo->nama_barang ?? '-';
            $displayStatus = $stokInfo->statusDetail->nama_status ?? 'N/A';

            if ($type === 'active_loans') {
            $relevantDate = $stokInfo->tanggal_keluar;
            $responsiblePerson = $stokInfo->userPeminjam->name ?? '-';
            $workshopName = $stokInfo->workshop->name ?? '-';
            } elseif ($type === 'available' || $type === 'all_stock') {
            $relevantDate = $stokInfo->tanggal_masuk;
            $responsiblePerson = $stokInfo->createdBy->name ?? '-';
            $workshopName = '-';

            // --- HAPUS LOGIKA LAMA (AKAN DIGANTI DI BAWAH) ---
            // if ($type === 'all_stock') {
            // $responsiblePerson = $stokInfo->userPeminjam->name ?? $stokInfo->workshop->name ?? ($displayStatus == 'Tersedia' ? 'Stok Gudang' : '-');
            // }
            }
            }
            @endphp
            <tr>
                @if($type === 'accountability')
                    <td>{{ $item->kode_unik ?? $item->stokBarang->kode_unik ?? '-' }}</td>
                @else
                    <td>{{ $kodeUnik }}</td>
                @endif
                @if($type === 'accountability')
                    <td>{{ $item->serial_number ?? $item->stokBarang->serial_number ?? '-' }}</td>
                @else
                    <td>{{ $serialNumber }}</td>
                @endif
                @if($type === 'accountability')
                    <td>{{ optional($item->masterBarang)->nama_barang ?? optional(optional($item->stokBarang)->masterBarang)->nama_barang ?? '-' }}</td>
                @else
                    <td>{{ $namaBarang }}</td>
                @endif
                @if($type === 'in' || $type === 'out')
                    <td>{{ $previousDisplayStatus }}</td>
                    <td>{{ $displayStatus }}</td>
                @else
                    <td>{{ $displayStatus }}</td>
                @endif
                <td>{{ $relevantDate ? \Carbon\Carbon::parse($relevantDate)->format('d M Y H:i') : '-' }}</td>

                <td>
                    @if ($type === 'all_stock')
                        @switch($stokInfo->statusDetail->nama_status ?? null)
                        @case('Digunakan')
                        @case('Dipinjam')
                        {{ $stokInfo->userPeminjam->name ?? $stokInfo->workshop->name ?? '-' }}
                        @break
                        @case('Rusak')
                        {{ $stokInfo->userPerusak->name ?? '-' }}
                        @break
                        @case('Hilang')
                        {{ $stokInfo->userPenghilang->name ?? '-' }}
                        @break
                        @case('Perbaikan')
                        {{ $stokInfo->teknisiPerbaikan->name ?? '-' }}
                        @break
                        @default
                        -
                        @endswitch
                    @elseif ($type === 'accountability' || $type === 'item_history')
                        @switch($displayStatus) {{-- Menggunakan $displayStatus dari $item --}}
                        @case('Rusak')
                        {{ $item->userPerusak->name ?? $item->relatedUser->name ?? '-' }}
                        @break
                        @case('Hilang')
                        {{ $item->userPenghilang->name ?? $item->relatedUser->name ?? '-' }}
                        @break
                        @case('Perbaikan')
                        {{ $item->teknisiPerbaikan->name ?? $item->relatedUser->name ?? '-' }}
                        @break
                        @default
                        {{ $responsiblePerson }} {{-- Fallback ke logika lama jika statusnya lain --}}
                        @endswitch
                    @else
                        {{ $responsiblePerson }} {{-- Fallback untuk tipe laporan lain (mis. 'in', 'out') --}}
                    @endif
                </td>

                @if(!in_array($type, ['in', 'accountability', 'available']))<td>{{ $workshopName }}</td>@endif
                @if($type === 'out' || $type === 'accountability' || $type === 'item_history')<td>{{ $deskripsi }}</td>@endif
            </tr>
            @empty
            <tr>
                @php
                if ($type === 'in') {
                    $colspan = 7;
                } elseif ($type === 'available'){
                    $colspan = 6;
                } elseif ($type === 'out') {
                    $colspan = 9;
                } elseif ($type === 'item_history') {
                    $colspan = 8;
                } else {
                    $colspan = 7; 
                }
                @endphp
                <td colspan="{{ $colspan }}" style="text-align: center;">Tidak ada data yang sesuai dengan filter.</td>
            </tr>
            @endforelse
        </tbody>
    </table>
</body>

</html>