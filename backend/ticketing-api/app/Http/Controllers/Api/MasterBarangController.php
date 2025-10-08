<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\MasterBarang;
use App\Models\StokBarang;
use App\Models\MasterKategori;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\Auth;

class MasterBarangController extends Controller
{
    /**
     * Menampilkan daftar tipe barang (MasterBarang).
     * Stok dihitung secara real-time dari item individual.
     */
    public function index(Request $request)
    {
        $query = MasterBarang::with(['masterKategori', 'subKategori', 'createdBy']);
        if ($request->filled('id_kategori')) {
            $query->where('id_kategori', $request->id_kategori);
        }
        if ($request->filled('id_sub_kategori')) {
            $query->where('id_sub_kategori', $request->id_sub_kategori);
        }
        if ($request->has('with_stock')) {
        $query->withCount(['stokBarangs as stok_tersedia' => function ($q) {
            $q->where('status_id', 1); 
        }]);
    }
        $query->latest();
        if ($request->has('all')) {
            return $query->get();
        }
        return $query->paginate(10);
    }

    // Untuk mengecek apakah master barang sudah ada
    public function checkIfExists(Request $request)
    {
        $validated = $request->validate([
            'nama_barang' => 'required|string',
            'id_sub_kategori' => 'required|integer',
        ]);

        $exists = MasterBarang::where('nama_barang', $validated['nama_barang'])
            ->where('id_sub_kategori', $validated['id_sub_kategori'])
            ->exists();

        return response()->json(['exists' => $exists]);
    }

    /**
     * Menyimpan tipe barang baru (MasterBarang) dan membuat item fisiknya (InventoryItem).
     * Jika nama barang sudah ada, hanya akan menambah stok item fisiknya.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'id_kategori' => 'required|exists:master_kategoris,id_kategori',
            'id_sub_kategori' => 'required|exists:sub_kategoris,id_sub_kategori',
            'nama_barang' => [
                'required',
                'string',
                'max:255',
                Rule::unique('master_barangs')->where(function ($query) use ($request) {
                    return $query->where('id_sub_kategori', $request->id_sub_kategori);
                }),
            ],
        ]);

        $kategori = MasterKategori::find($validated['id_kategori']);
        $kodeSub = str_pad($validated['id_sub_kategori'], 2, '0', STR_PAD_LEFT);
        $dataToCreate = array_merge($validated, [
            'kode_barang' => $kategori->kode_kategori . $kodeSub,
            'created_by' => Auth::id(),
        ]);


        $masterBarang = MasterBarang::create($dataToCreate);

        return response()->json($masterBarang->load(['masterKategori', 'subKategori']), 201);
    }

    /**
     * Generator kode unik sesuai dengan aturan yang kompleks.
     */
    private function generateUniqueStokCode(MasterBarang $masterBarang): string
    {
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
    public function update(Request $request, MasterBarang $masterBarang)
    {
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
    public function destroy(MasterBarang $masterBarang)
    {
        if ($masterBarang->stokBarangs()->exists()) {
            return response()->json(['message' => 'SKU barang tidak dapat dihapus karena masih ada stok fisiknya.'], 422);
        }
        $masterBarang->delete();
        return response()->json(['message' => 'SKU barang berhasil dihapus.'], 200);
    }
}
