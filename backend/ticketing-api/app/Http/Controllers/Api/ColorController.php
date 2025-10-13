<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Color;
use Illuminate\Validation\Rule; // <-- Jangan lupa import Rule

class ColorController extends Controller
{
    /**
     * Menampilkan daftar semua warna.
     */
    public function index()
    {
        return Color::orderBy('nama_warna')->get();
    }

    /**
     * Menyimpan warna baru.
     */
    // public function store(Request $request)
    // {
    //     $validated = $request->validate([
    //         'nama_warna' => 'required|string|unique:colors,nama_warna',
    //     ]);

    //     $kode_hex = getColorFromName($validated['nama_warna']);

    //     if ($kode_hex === 'transparent') {
    //         $kode_hex = '#CCCCCC'; 
    //     }

    //     $color = Color::create([
    //         'nama_warna' => $validated['nama_warna'],
    //         'kode_hex' => $kode_hex,
    //     ]);

    //     return response()->json($color, 201);
    // }

    /**
     * BARU: Menampilkan satu warna spesifik.
     */
    public function show(Color $color) // Menggunakan Route-Model Binding
    {
        return response()->json($color);
    }

    /**
     * BARU: Memperbarui data warna yang ada.
     */
    public function update(Request $request, Color $color)
    {
        $validated = $request->validate([
            // Nama warna harus unik, kecuali untuk dirinya sendiri
            'nama_warna' => ['required', 'string', Rule::unique('colors')->ignore($color->id_warna, 'id_warna')],
            'kode_hex' => 'required|string|regex:/^#[a-fA-F0-9]{6}$/',
        ]);

        $color->update($validated);
        return response()->json($color);
    }

    /**
     * BARU: Menghapus data warna.
     */
    public function destroy(Color $color)
    {
        // Logika pengaman: Jangan hapus warna jika masih digunakan oleh stok barang
        if ($color->stokBarangs()->exists()) {
            return response()->json(['message' => 'Warna tidak dapat dihapus karena masih digunakan oleh stok barang.'], 422);
        }

        $color->delete();
        return response()->json(null, 204); // 204 No Content
    }
}
