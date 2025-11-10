<!DOCTYPE html>
<html>
<head>
    <title>Catatan Pengajuan Pembelian</title>
    <style>
        body { font-family: 'Helvetica', sans-serif; font-size: 10px; }
        .table { width: 100%; border-collapse: collapse; table-layout: fixed; }
        .table th, .table td { border: 1px solid #ddd; padding: 6px; text-align: left; word-wrap: break-word; }
        .table th { background-color: #f2f2f2; font-size: 11px; }
        .header { text-align: center; margin-bottom: 20px; }
        .header h2 { margin: 0; }
        .header p { margin: 5px 0; }
        .text-right { text-align: right; }
        .total-row td { font-weight: bold; background-color: #f9f9f9; }
        .item-row td { vertical-align: top; }
        .notes-link {
            overflow-wrap: break-word;
            font-size: 9px;
        }
    </style>
</head>
<body>
    <div class="header">
        <h2>Catatan Pengajuan Pembelian</h2>
        <p><strong>Judul:</strong> {{ $proposal->title }}</p>
        <p><strong>Dibuat Oleh:</strong> {{ $proposal->createdByUser->name }}</p>
        <p><strong>Tanggal Dibuat:</strong> {{ $proposal->created_at->format('d F Y, H:i') }}</p>
    </div>

    <h3 style="margin-top: 25px;">Rincian Barang</h3>
    <table class="table">
        <thead>
            <tr>
                <th style="width: 18%;">Nama Barang</th>
                <th style="width: 12%;">Kategori</th>
                <th style="width: 7%;">Jumlah</th>
                <th class="text-right" style="width: 13%;">Estimasi Harga</th>
                <th class="text-right" style="width: 15%;">Total Estimasi</th>
                <th style="width: 35%;">Keterangan/Link</th>
            </tr>
        </thead>
        <tbody>
            @forelse ($proposal->items as $item)
            <tr class="item-row">
                <td>{{ $item->masterBarang->nama_barang }}</td>
                <td>{{ $item->masterBarang->masterKategori->nama_kategori ?? 'N/A' }}</td>
                <td>{{ $item->quantity }} Unit</td>
                <td class="text-right">Rp {{ number_format($item->estimated_price, 0, ',', '.') }}</td>
                <td class="text-right">Rp {{ number_format($item->estimated_price * $item->quantity, 0, ',', '.') }}</td>
                <td class="notes-link">
                    @if($item->notes) <strong>Catatan:</strong> {{ $item->notes }} <br> @endif
                    @if($item->link) <strong>Link:</strong> {{ $item->link }} @endif
                </td>
            </tr>
            @empty
            <tr><td colspan="6" style="text-align: center;">Tidak ada barang dalam catatan ini.</td></tr>
            @endforelse
            <tr class="total-row">
                <td colspan="4" class="text-right">TOTAL ESTIMASI KESELURUHAN</td>
                <td class="text-right">Rp {{ number_format($proposal->total_estimated_cost, 0, ',', '.') }}</td>
                <td></td>
            </tr>
        </tbody>
    </table>
</body>
</html>