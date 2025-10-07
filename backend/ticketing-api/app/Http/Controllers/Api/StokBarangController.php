<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\StokBarang;
use App\Models\MasterBarang;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\DB;

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

    public function store(Request $request)
    {
        $validated = $request->validate([
            'master_barang_id' => 'required|exists:master_barangs,id_m_barang',
            'jumlah' => 'required|integer|min:1',
            'harga_beli' => 'required|numeric|min:0',
            'kondisi' => 'required|in:Baru,Bekas',
            'warna' => 'nullable|string|max:255',
            'tanggal_pembelian' => 'nullable|date',
            'serial_numbers' => 'nullable|array',
            'serial_numbers.*' => 'nullable|string|unique:stok_barangs,serial_number',
        ]);

        $masterBarang = MasterBarang::find($validated['master_barang_id']);
        
        DB::transaction(function () use ($validated, $masterBarang) {
            for ($i = 0; $i < $validated['jumlah']; $i++) {
                StokBarang::create([
                    'master_barang_id' => $masterBarang->id_m_barang,
                    'kode_unik' => $this->generateUniqueStokCode($masterBarang),
                    'serial_number' => $validated['serial_numbers'][$i] ?? null,
                    'harga_beli' => $validated['harga_beli'],
                    'warna' => $validated['warna'] ?? null,
                    'kondisi' => $validated['kondisi'],
                    'status' => 'Tersedia', // Status ketersediaan
                    'tanggal_pembelian' => $validated['tanggal_pembelian'] ?? now(),
                    'tanggal_masuk' => now(),
                ]);
            }
        });

        return response()->json(['message' => 'Stok berhasil ditambahkan.'], 201);
    }

    private function generateUniqueStokCode(MasterBarang $masterBarang): string {
        $baseCode = $masterBarang->kode_barang;
        $latestItem = StokBarang::where('kode_unik', 'LIKE', $baseCode . '%')
            ->orderBy('kode_unik', 'desc')
            ->first();
            
        $sequence = 1;
        if ($latestItem) {
            $lastSequence = (int) substr($latestItem->kode_unik, -3);
            $sequence = $lastSequence + 1;
        }
        $sequencePart = str_pad($sequence, 3, '0', STR_PAD_LEFT);
        return $baseCode . $sequencePart;
    }
}