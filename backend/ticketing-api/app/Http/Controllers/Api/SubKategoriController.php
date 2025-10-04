<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\SubKategori;
use Illuminate\Http\Request;

class SubKategoriController extends Controller
{
    /**
     * Display a listing of the resource.
     * Menampilkan sub-kategori, bisa difilter berdasarkan id_kategori.
     */
    public function index(Request $request)
    {
        $query = SubKategori::query();

        if ($request->has('id_kategori')) {
            $query->where('id_kategori', $request->id_kategori);
        }

        return $query->with('masterKategori')->latest()->get();
    }

    /**
     * Store a newly created resource in storage.
     * Menyimpan sub-kategori baru.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'id_kategori' => 'required|exists:master_kategoris,id_kategori',
            'nama_sub' => 'required|string|max:255',
        ]);

        $subKategori = SubKategori::create($validated);

        return response()->json($subKategori->load('masterKategori'), 201);
    }

    /**
     * Display the specified resource.
     * Menampilkan satu sub-kategori spesifik.
     */
    public function show(SubKategori $subKategori)
    {
        return response()->json($subKategori->load('masterKategori'));
    }

    /**
     * Update the specified resource in storage.
     * Memperbarui data sub-kategori.
     */
    public function update(Request $request, SubKategori $subKategori)
    {
        $validated = $request->validate([
            'id_kategori' => 'sometimes|required|exists:master_kategoris,id_kategori',
            'nama_sub' => 'sometimes|required|string|max:255',
        ]);

        $subKategori->update($validated);

        return response()->json($subKategori->load('masterKategori'));
    }

    /**
     * Remove the specified resource from storage.
     * Menghapus sub-kategori.
     */
    public function destroy(SubKategori $subKategori)
    {
        // Cek apakah ada barang yang masih terkait
        if ($subKategori->masterBarangs()->exists()) {
            return response()->json(['message' => 'Sub-Kategori tidak dapat dihapus karena masih memiliki barang terkait.'], 422);
        }

        $subKategori->delete();

        return response()->json(null, 204);
    }
}
