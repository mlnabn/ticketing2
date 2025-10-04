<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\MasterKategori;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class MasterKategoriController extends Controller
{
    /**
     * Display a listing of the resource.
     * Menampilkan semua kategori.
     */
    public function index()
    {
        // Mengembalikan semua kategori, diurutkan dari yang terbaru
        return MasterKategori::latest()->get();
    }

    /**
     * Store a newly created resource in storage.
     * Menyimpan kategori baru.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'nama_kategori' => 'required|string|max:255|unique:master_kategoris,nama_kategori',
        ]);

        // Membuat kode kategori otomatis dari 3 huruf pertama nama kategori
        $validated['kode_kategori'] = strtoupper(Str::substr($validated['nama_kategori'], 0, 3));

        $kategori = MasterKategori::create($validated);

        return response()->json($kategori, 201);
    }

    /**
     * Display the specified resource.
     * Menampilkan satu kategori spesifik.
     */
    public function show(MasterKategori $masterKategori)
    {
        return response()->json($masterKategori);
    }

    /**
     * Update the specified resource in storage.
     * Memperbarui data kategori.
     */
    public function update(Request $request, MasterKategori $masterKategori)
    {
        $validated = $request->validate([
            'nama_kategori' => 'required|string|max:255|unique:master_kategoris,nama_kategori,' . $masterKategori->id_kategori . ',id_kategori',
        ]);

        // Update juga kode kategori jika nama berubah
        $validated['kode_kategori'] = strtoupper(Str::substr($validated['nama_kategori'], 0, 3));

        $masterKategori->update($validated);

        return response()->json($masterKategori);
    }

    /**
     * Remove the specified resource from storage.
     * Menghapus kategori.
     */
    public function destroy(MasterKategori $masterKategori)
    {
        // Cek apakah ada sub-kategori atau barang yang masih terkait
        if ($masterKategori->subKategoris()->exists() || $masterKategori->masterBarangs()->exists()) {
            return response()->json(['message' => 'Kategori tidak dapat dihapus karena masih memiliki sub-kategori atau barang terkait.'], 422);
        }

        $masterKategori->delete();

        return response()->json(null, 204);
    }
}
