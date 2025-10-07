<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\StokBarang;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class StokBarangController extends Controller {
    public function index(Request $request) {
        $query = StokBarang::with(['masterBarang.masterKategori', 'masterBarang.subKategori']);

        if ($request->filled('id_kategori')) {
            $query->whereHas('masterBarang', fn($q) => $q->where('id_kategori', $request->id_kategori));
        }
        if ($request->filled('id_sub_kategori')) {
            $query->whereHas('masterBarang', fn($q) => $q->where('id_sub_kategori', $request->id_sub_kategori));
        }

        return $query->latest()->paginate(25); // Tampilkan lebih banyak per halaman
    }

    public function update(Request $request, StokBarang $stokBarang)
    {
        $validated = $request->validate([
            'serial_number' => [
                'nullable',
                'string',
                'max:255',
                Rule::unique('stok_barangs')->ignore($stokBarang->id),
            ],
            'status' => 'required|in:Tersedia,Dipinjam,Perbaikan,Rusak,Hilang',
            'tanggal_pembelian' => 'nullable|date',
            'harga_beli' => 'required|numeric|min:0',
            'kondisi' => 'required|in:Baru,Bekas',
            'warna' => 'nullable|string|max:255'
        ]);

        $stokBarang->update($validated);

        // Kembalikan data yang sudah di-update dengan relasinya
        return response()->json($stokBarang->load(['masterBarang.masterKategori', 'masterBarang.subKategori']));
    }
    
    public function showBySerial($serial) {
        $item = StokBarang::with(['masterBarang.masterKategori', 'masterBarang.subKategori'])
            ->where('serial_number', $serial)
            ->firstOrFail();
            
        return response()->json($item);
    }
}