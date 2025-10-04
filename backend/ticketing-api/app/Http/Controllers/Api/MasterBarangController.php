<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\MasterBarang;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class MasterBarangController extends Controller
{
    /**
     * Display a listing of the resource.
     * Menampilkan daftar barang dengan filter dan pagination.
     */
    public function index(Request $request)
    {
        $query = MasterBarang::with(['masterKategori', 'subKategori']);

        if ($request->filled('id_kategori')) {
            $query->where('id_kategori', $request->id_kategori);
        }
        if ($request->filled('id_sub_kategori')) {
            $query->where('id_sub_kategori', $request->id_sub_kategori);
        }

        // --- TAMBAHKAN LOGIKA INI ---
        if ($request->query('all')) {
            return $query->where('stok', '>', 0)->latest()->get();
        }
        // --- AKHIR PENAMBAHAN ---

        return $query->latest()->paginate(15);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'id_kategori' => 'required|exists:master_kategoris,id_kategori',
            'id_sub_kategori' => 'required|exists:sub_kategoris,id_sub_kategori',
            'nama_barang' => 'required|string|max:255',
            'merk' => 'nullable|string|max:100',
            'model_barang' => 'nullable|string|max:100',
            'tanggal_pembelian' => 'nullable|date',
            'tanggal_masuk' => 'nullable|date',
            'digunakan_untuk' => 'nullable|string|max:255',
            'stok' => 'required|integer|min:0',
            'harga_barang' => 'nullable|numeric|min:0',
            'warna' => 'nullable|string|max:50',
            'status_barang' => 'nullable|string|max:50',
        ]);

        // Membuat kode barang unik menggunakan fungsi helper
        $validated['kode_barang'] = $this->generateUniqueItemCode($validated['nama_barang']);

        $barang = MasterBarang::create($validated);
        return response()->json($barang->load(['masterKategori', 'subKategori']), 201);
    }

    /**
     * Helper function untuk membuat kode barang yang unik.
     */
    private function generateUniqueItemCode(string $name): string
    {
        // 1. Membersihkan nama dari angka dan simbol di awal, serta spasi berlebih
        $cleanedName = preg_replace('/[^a-zA-Z0-9\s]/', '', $name);
        $words = preg_split('/\s+/', $cleanedName, -1, PREG_SPLIT_NO_EMPTY);

        // Filter hanya kata yang mengandung huruf
        $validWords = array_filter($words, fn($word) => preg_match('/[a-zA-Z]/', $word));
        $validWords = array_values($validWords); // re-index array

        $initialCode = '';

        if (count($validWords) > 1) {
            // Jika Nama > 1 Kata
            $firstChar = strtoupper(substr($validWords[0], 0, 1));
            $secondChar = strtoupper(substr($validWords[1], 0, 1));
            $initialCode = $firstChar . $secondChar;
        } elseif (count($validWords) === 1) {
            // Jika Nama = 1 Kata
            $word = $validWords[0];
            $firstChar = strtoupper(substr($word, 0, 1));
            if (strlen($word) >= 3) {
                // Ambil huruf pertama dan ketiga
                $secondChar = strtoupper(substr($word, 2, 1));
            } else {
                // Jika kata lebih pendek, ambil huruf pertama dan terakhir
                $secondChar = strtoupper(substr($word, -1, 1));
            }
            $initialCode = $firstChar . $secondChar;
        } else {
            // Fallback jika tidak ada kata valid (misal: "123")
            $initialCode = 'XX';
        }

        // 2. Memastikan kode unik
        $finalCode = $initialCode;
        $suffix = 1;
        $originalSecondChar = $initialCode[1];

        while (MasterBarang::where('kode_barang', $finalCode)->exists()) {
            $nextCharCode = ord($originalSecondChar) + $suffix;
            if ($nextCharCode <= ord('Z')) {
                // Coba ZP -> ZQ -> ZR ...
                $finalCode = $initialCode[0] . chr($nextCharCode);
            } else {
                // Jika sudah melewati Z, tambahkan angka. Cth: ZP1, ZP2
                $finalCode = $initialCode . ($suffix - (ord('Z') - ord($originalSecondChar)));
            }
            $suffix++;
        }

        return $finalCode;
    }

    /**
     * Display the specified resource.
     * Menampilkan satu data barang spesifik.
     */
    public function show(MasterBarang $masterBarang)
    {
        return $masterBarang->load(['masterKategori', 'subKategori']);
    }

    /**
     * Update the specified resource in storage.
     * Memperbarui data barang.
     */
    public function update(Request $request, MasterBarang $masterBarang)
    {
        // Validasi mirip dengan store, tapi 'sometimes' agar tidak wajib diisi semua
        $validated = $request->validate([
            'id_kategori' => 'sometimes|required|exists:master_kategoris,id_kategori',
            'id_sub_kategori' => 'sometimes|required|exists:sub_kategoris,id_sub_kategori',
            'nama_barang' => 'sometimes|required|string|max:255',
            'merk' => 'nullable|string|max:100',
            'model_barang' => 'nullable|string|max:100',
            'tanggal_pembelian' => 'nullable|date',
            'tanggal_masuk' => 'nullable|date',
            'digunakan_untuk' => 'nullable|string|max:255',
            'stok' => 'sometimes|required|integer|min:0',
            'harga_barang' => 'nullable|numeric|min:0',
            'warna' => 'nullable|string|max:50',
            'status_barang' => 'sometimes|required|string|max:50',
        ]);

        $masterBarang->update($validated);
        return response()->json($masterBarang->load(['masterKategori', 'subKategori']));
    }


    public function destroy(MasterBarang $masterBarang)
    {
        if ($masterBarang->tickets()->exists()) {
            return response()->json([
                'message' => 'Barang tidak dapat dihapus karena memiliki riwayat peminjaman.'
            ], 422); 
        }

        $deleted = $masterBarang->delete();

        if ($deleted) {
            return response()->json(['message' => 'Barang berhasil dihapus.'], 200);
        }

        return response()->json(['message' => 'Gagal menghapus barang dari database.'], 500);
    }
}
