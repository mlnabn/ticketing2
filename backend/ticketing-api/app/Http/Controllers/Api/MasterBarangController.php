<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\MasterBarang;
use App\Models\StokBarang;
use App\Models\MasterKategori;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

class MasterBarangController extends Controller
{
    /**
     * Menampilkan daftar tipe barang (MasterBarang).
     * Stok dihitung secara real-time dari item individual.
     */
    public function index(Request $request) {
        $query = MasterBarang::with(['masterKategori', 'subKategori']);
        if ($request->filled('id_kategori')) { $query->where('id_kategori', $request->id_kategori); }
        if ($request->filled('id_sub_kategori')) { $query->where('id_sub_kategori', $request->id_sub_kategori); }
        return $query->latest()->paginate(10);
    }

    /**
     * Menyimpan tipe barang baru (MasterBarang) dan membuat item fisiknya (InventoryItem).
     * Jika nama barang sudah ada, hanya akan menambah stok item fisiknya.
     */
    public function store(Request $request) {
        $validated = $request->validate([
            'id_kategori' => 'required|exists:master_kategoris,id_kategori',
            'id_sub_kategori' => 'required|exists:sub_kategoris,id_sub_kategori',
            'nama_barang' => 'required|string|max:255',
            'kondisi' => 'required|in:Baru,Bekas',
            'harga_beli' => 'required|numeric|min:0',
            'jumlah' => 'required|integer|min:1',
            'tanggal_pembelian' => 'nullable|date',
            'warna' => 'nullable|string|max:255',
            'serial_numbers' => 'nullable|array',
            'serial_numbers.*' => 'nullable|string|unique:stok_barangs,serial_number',
        ]);

        $masterBarang = null;
        DB::transaction(function () use ($validated, &$masterBarang) {
            $masterBarang = MasterBarang::firstOrCreate(
                [
                    'nama_barang' => $validated['nama_barang'],
                    'id_sub_kategori' => $validated['id_sub_kategori'],
                ],
                [ 
                    'id_kategori' => $validated['id_kategori'],
                    'harga_barang' => $validated['harga_beli'],
                ]
            );

            if ($masterBarang->wasRecentlyCreated) {
                $kategori = MasterKategori::find($validated['id_kategori']);
                $kodeSub = str_pad($validated['id_sub_kategori'], 2, '0', STR_PAD_LEFT);
                $masterBarang->kode_barang = $kategori->kode_kategori . $kodeSub;
                $masterBarang->save();
            }

            for ($i = 0; $i < $validated['jumlah']; $i++) {
                StokBarang::create([
                    'master_barang_id' => $masterBarang->id_m_barang,
                    'kode_unik' => $this->generateUniqueStokCode($masterBarang),
                    'serial_number' => $validated['serial_numbers'][$i] ?? null,
                    'harga_beli' => $validated['harga_beli'],
                    'warna' => $validated['warna'] ?? null,
                    'kondisi' => $validated['kondisi'],
                    'status' => 'Tersedia',
                    'tanggal_pembelian' => $validated['tanggal_pembelian'] ?? now(),
                    'tanggal_masuk' => now(),
                ]);
            }
        });
        return response()->json($masterBarang->load(['masterKategori', 'subKategori']), 201);
    }

    /**
     * Generator kode unik sesuai dengan aturan yang kompleks.
     */
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

    /**
     * Menampilkan satu tipe barang (MasterBarang) spesifik.
     */
    public function show(MasterBarang $masterBarang)
    {
        return $masterBarang->load(['masterKategori', 'subKategori']);
    }

    /**
     * Memperbarui data dari sebuah tipe barang (MasterBarang).
     * Tidak mempengaruhi item individual yang sudah ada.
     */
    public function update(Request $request, MasterBarang $masterBarang) {
        $validated = $request->validate([
            'nama_barang' => ['required', 'string', 'max:255', Rule::unique('master_barangs')->ignore($masterBarang->id_m_barang, 'id_m_barang')],
        ]);
        $masterBarang->update($validated);
        return response()->json($masterBarang);
    }

    /**
     * Menghapus sebuah tipe barang (MasterBarang).
     * Hanya bisa dilakukan jika tidak ada lagi item fisik yang tercatat.
     */
    public function destroy(MasterBarang $masterBarang) {
        if ($masterBarang->stokBarangs()->exists()) {
            return response()->json(['message' => 'SKU barang tidak dapat dihapus karena masih ada stok fisiknya.'], 422);
        }
        $masterBarang->delete();
        return response()->json(['message' => 'SKU barang berhasil dihapus.'], 200);
    }
}