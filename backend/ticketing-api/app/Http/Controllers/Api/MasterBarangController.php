<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\MasterBarang;
use App\Models\StokBarang;
use App\Models\MasterKategori;
use App\Models\SubKategori;
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
        return $query->latest()->paginate(10);
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
                Rule::unique('master_barangs')->where(
                    fn($query) =>
                    $query->where('id_sub_kategori', $request->id_sub_kategori)
                ),
            ],
        ]);

        // --- LOGIKA BARU YANG LEBIH SEDERHANA ---

        // 1. Ambil model Kategori dan Sub-Kategori
        $kategori = MasterKategori::find($validated['id_kategori']);
        $subKategori = SubKategori::find($validated['id_sub_kategori']);

        // 2. Pastikan kode sub-kategori ada, jika tidak, buat sekarang
        if (empty($subKategori->kode_sub_kategori)) {
            // Memanggil fungsi publik dari SubKategoriController
            $subKategori->kode_sub_kategori = (new SubKategoriController)->generateSubKategoriCode($subKategori->nama_sub);
            $subKategori->save();
        }

        // 3. Gabungkan kode awalan SAJA (tanpa nomor urut)
        $baseCode = $kategori->kode_kategori . $subKategori->kode_sub_kategori; // Hasilnya: "RUZT"

        // 4. Simpan MasterBarang baru dengan kode dasar tersebut
        $dataToCreate = array_merge($validated, [
            'kode_barang' => $baseCode, // <-- Hanya menyimpan kode dasar
            'created_by' => Auth::id(),
        ]);

        $masterBarang = MasterBarang::create($dataToCreate);

        return response()->json($masterBarang->load(['masterKategori', 'subKategori']), 201);
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
