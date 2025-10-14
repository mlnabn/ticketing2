<!DOCTYPE html>
<html>
<head>
    <title>Laporan Keuangan Aset</title>
    <style>
        body { font-family: sans-serif; font-size: 10px; }
        .table { width: 100%; border-collapse: collapse; }
        .table th, .table td { border: 1px solid #ddd; padding: 6px; text-align: left; }
        .table th { background-color: #f2f2f2; }
        .header { text-align: center; margin-bottom: 20px; }
        .header h2 { margin: 0; }
        .text-right { text-align: right; }
        .subtotal { background-color: #f9f9f9; font-weight: bold; }
        .section-header { background-color: #e9ecef; font-weight: bold; }
    </style>
</head>
<body>
    <div class="header">
        <h2>Laporan Keuangan Aset</h2>
        <p>Periode: {{ $period }}</p>
        <p>Tanggal Laporan: {{ date('d F Y') }}</p>
    </div>

    <h3>Ringkasan</h3>
    <table class="table">
        <tr>
            <td>Total Nilai Aset (Hingga Periode Ini)</td>
            <td class="text-right">{{ 'Rp ' . number_format($summary['total_asset_value'], 0, ',', '.') }}</td>
        </tr>
        <tr>
            <td>Nilai Aset Bersih (Net)</td>
            <td class="text-right">{{ 'Rp ' . number_format($summary['net_asset_value'], 0, ',', '.') }}</td>
        </tr>
        <tr>
            <td>Nilai Pembelian Baru (Periode Ini)</td>
            <td class="text-right">{{ 'Rp ' . number_format($summary['new_asset_value'], 0, ',', '.') }}</td>
        </tr>
        <tr>
            <td>Potensi Kerugian (Aset Rusak/Hilang)</td>
            <td class="text-right">({{ 'Rp ' . number_format($summary['problematic_asset_value'], 0, ',', '.') }})</td>
        </tr>
    </table>

    <h3 style="margin-top: 30px;">Rincian Transaksi</h3>
    <table class="table">
        <thead>
            <tr>
                <th>Tanggal</th>
                <th>Kode Unik</th>
                <th>Nama Barang</th>
                <th class="text-right">Nilai</th>
            </tr>
        </thead>
        <tbody>
            <tr class="section-header"><td colspan="4">Pembelian Baru (Aset Masuk)</td></tr>
            @forelse ($details['new_acquisitions'] as $item)
            <tr>
                <td>{{ \Carbon\Carbon::parse($item['tanggal_pembelian'])->format('d/m/Y') }}</td>
                <td>{{ $item['kode_unik'] }}</td>
                <td>{{ $item['master_barang']['nama_barang'] }}</td>
                <td class="text-right">{{ 'Rp ' . number_format($item['harga_beli'], 0, ',', '.') }}</td>
            </tr>
            @empty
            <tr><td colspan="4" style="text-align: center;">Tidak ada data.</td></tr>
            @endforelse
            <tr class="subtotal">
                <td colspan="3" class="text-right">Subtotal</td>
                <td class="text-right">{{ 'Rp ' . number_format(collect($details['new_acquisitions'])->sum('harga_beli'), 0, ',', '.') }}</td>
            </tr>

            <tr class="section-header"><td colspan="4">Potensi Kerugian (Aset Rusak/Hilang)</td></tr>
            @forelse ($details['problematic_assets'] as $item)
            <tr>
                <td>{{ \Carbon\Carbon::parse($item['tanggal_rusak'] ?? $item['tanggal_hilang'])->format('d/m/Y') }}</td>
                <td>{{ $item['kode_unik'] }}</td>
                <td>{{ $item['master_barang']['nama_barang'] }}</td>
                <td class="text-right">({{ 'Rp ' . number_format($item['harga_beli'], 0, ',', '.') }})</td>
            </tr>
            @empty
            <tr><td colspan="4" style="text-align: center;">Tidak ada data.</td></tr>
            @endforelse
            <tr class="subtotal">
                <td colspan="3" class="text-right">Subtotal</td>
                <td class="text-right">({{ 'Rp ' . number_format(collect($details['problematic_assets'])->sum('harga_beli'), 0, ',', '.') }})</td>
            </tr>
        </tbody>
    </table>
</body>
</html>