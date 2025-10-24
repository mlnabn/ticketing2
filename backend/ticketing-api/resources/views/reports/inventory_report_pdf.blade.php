<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>{{ $title }}</title>
    <style>
        body { font-family: 'Helvetica', sans-serif; color: #333; }
        .header h1 { text-align: center; margin: 0; font-size: 18px; } /* Ukuran font disesuaikan */
        .header p { text-align: center; margin: 5px 0 15px; font-size: 11px; color: #777;}
        table { width: 100%; border-collapse: collapse; }
        th, td { border: 1px solid #ddd; text-align: left; padding: 6px; font-size: 9px; vertical-align: top; word-wrap: break-word; } /* Padding & font diperkecil */
        th { background-color: #f2f2f2; font-weight: bold; }
        tbody tr:nth-child(even) { background-color: #f9f9f9; }
        .text-center { text-align: center; }
        .text-right { text-align: right; }
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
                {{-- [MODIFIKASI] Logika Header Disesuaikan --}}
                @php
                    $isHistoryBased = in_array($type, ['in', 'out', 'accountability']);
                @endphp

                <th>Kode Unik</th>
                <th>Serial Number</th> {{-- <-- Tambah SN --}}
                <th>Nama Barang</th>
                <th>
                    @if($isHistoryBased) Status Kejadian
                    @elseif($type === 'active_loans') Status
                    @elseif($type === 'available') Status
                    @elseif($type === 'all_stock') Status Saat Ini
                    @else Status @endif
                </th>
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
                <th>
                    @if($isHistoryBased) Workshop (Saat Kejadian)
                    @elseif($type === 'active_loans') Lokasi Peminjaman
                    @else Workshop @endif
                </th>
                {{-- Opsional: Tambah kolom lain jika perlu (misal: Kondisi, Harga Beli untuk tipe tertentu) --}}
                {{-- @if(in_array($type, ['available']))<th>Kondisi</th><th>Harga Beli</th>@endif --}}
            </tr>
        </thead>
        <tbody>
            @forelse($data as $item)
                @php
                    // Default values
                    $kodeUnik = '-';
                    $serialNumber = '-';
                    $namaBarang = '-';
                    $displayStatus = '-';
                    $relevantDate = null;
                    $responsiblePerson = '-';
                    $workshopName = '-';

                    $isHistoryBased = in_array($type, ['in', 'out', 'accountability']);

                    if ($isHistoryBased) {
                        // Data berasal dari StokBarangHistory ($item)
                        $stokInfo = $item->stokBarang ?? null; // Ambil relasi stokBarang (bisa null)
                        $masterInfo = $stokInfo->masterBarang ?? null; // Ambil relasi masterBarang (bisa null)

                        $kodeUnik = $stokInfo->kode_unik ?? '-';
                        $serialNumber = $stokInfo->serial_number ?? '-';
                        $namaBarang = $masterInfo->nama_barang ?? '-';
                        $displayStatus = $item->statusDetail->nama_status ?? 'N/A'; // Status saat history
                        $relevantDate = $item->event_date ?? $item->created_at; // Tanggal history

                        if ($type === 'in') {
                            $responsiblePerson = $item->triggeredByUser->name ?? '-';
                        } elseif ($type === 'out' || $type === 'accountability') {
                            $responsiblePerson = $item->relatedUser->name ?? $item->triggeredByUser->name ?? '-';
                        }
                        $workshopName = $item->workshop->name ?? '-'; // Workshop saat history

                    } else {
                        // Data berasal dari StokBarang langsung ($item)
                        $stokInfo = $item; // $item adalah StokBarang
                        $masterInfo = $stokInfo->masterBarang ?? null;

                        $kodeUnik = $stokInfo->kode_unik ?? '-';
                        $serialNumber = $stokInfo->serial_number ?? '-';
                        $namaBarang = $masterInfo->nama_barang ?? '-';
                        $displayStatus = $stokInfo->statusDetail->nama_status ?? 'N/A'; // Status item saat ini

                        if ($type === 'active_loans') {
                            $relevantDate = $stokInfo->tanggal_keluar;
                            $responsiblePerson = $stokInfo->userPeminjam->name ?? '-';
                            $workshopName = $stokInfo->workshop->name ?? '-';
                        } elseif ($type === 'available' || $type === 'all_stock') {
                            $relevantDate = $stokInfo->tanggal_masuk;
                            $responsiblePerson = $stokInfo->createdBy->name ?? '-';
                            $workshopName = '-'; // Biasanya tidak relevan untuk status tersedia/all stock
                             if ($type === 'all_stock') {
                                 // Logika khusus penanggung jawab/lokasi untuk all_stock
                                $responsiblePerson = $stokInfo->userPeminjam->name ?? $stokInfo->workshop->name ?? ($displayStatus == 'Tersedia' ? 'Stok Gudang' : '-');
                             }
                        }
                    }
                @endphp
                <tr>
                    <td>{{ $kodeUnik }}</td>
                    <td>{{ $serialNumber }}</td>
                    <td>{{ $namaBarang }}</td>
                    <td>{{ $displayStatus }}</td>
                    {{-- Format tanggal tetap sama --}}
                    <td>{{ $relevantDate ? \Carbon\Carbon::parse($relevantDate)->format('d M Y H:i') : '-' }}</td>
                    <td>{{ $responsiblePerson }}</td>
                    <td>{{ $workshopName }}</td>
                    {{-- Kolom opsional tetap sama --}}
                    {{-- @if(in_array($type, ['available']))<td>{{ $stokInfo->kondisi ?? '-' }}</td><td>{{ $stokInfo->harga_beli ?? '-' }}</td>@endif --}}
                </tr>
            @empty
            <tr>
                {{-- [MODIFIKASI] Menyesuaikan colspan --}}
                @php $colspan = 7; /* Default colspan */ @endphp
                {{-- @if(in_array($type, ['available'])) @php $colspan = 9; @endphp @endif --}}
                <td colspan="{{ $colspan }}" style="text-align: center;">Tidak ada data yang sesuai dengan filter.</td>
            </tr>
            @endforelse
        </tbody>
    </table>
</body>
</html>