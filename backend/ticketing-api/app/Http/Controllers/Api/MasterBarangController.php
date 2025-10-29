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
        $query = MasterBarang::query()
            ->join('master_kategoris', 'master_barangs.id_kategori', '=', 'master_kategoris.id_kategori')
            ->join('sub_kategoris', 'master_barangs.id_sub_kategori', '=', 'sub_kategoris.id_sub_kategori')
            
            ->select(
                'master_barangs.kode_barang',
                'master_kategoris.nama_kategori',
                'sub_kategoris.nama_sub',
                DB::raw('COUNT(master_barangs.id_m_barang) as variations_count') 
            )
            ->groupBy(
                'master_barangs.kode_barang',
                'master_kategoris.nama_kategori',
                'sub_kategoris.nama_sub'
            );

        // $query = MasterBarang::with(['masterKategori', 'subKategori', 'createdBy']);
        if ($request->filled('id_kategori')) {
            $query->where('master_barangs.id_kategori', $request->id_kategori);
        }
        if ($request->filled('id_sub_kategori')) {
            $query->where('master_barangs.id_sub_kategori', $request->id_sub_kategori);
        }
        if ($request->has('with_stock')) {
            $query->withCount(['stokBarangs as stok_tersedia' => function ($q) {
                $q->where('status_id', 1);
            }]);
        }
        $query->latest('master_barangs.kode_barang');
        if ($request->has('all')) {
            return $query->get();
        }
        return $query->paginate(15);
    }

    public function getVariations($kode_barang)
    {
        $tersediaStatusId = 1;
        $items = MasterBarang::where('kode_barang', $kode_barang)
                    ->with(['masterKategori', 'subKategori'])
                    ->withCount(['stokBarangs as stok_tersedia_count' => function ($query) use ($tersediaStatusId) {
                        $query->where('status_id', $tersediaStatusId);
                    }])
                    ->orderBy('nama_barang', 'asc')
                    ->get();
        
        return response()->json($items);
    }

    public function indexFlat(Request $request)
    {
        $query = MasterBarang::with(['masterKategori', 'subKategori', 'createdBy']);

        if ($request->filled('id_kategori')) {
            $query->where('id_kategori', $request->id_kategori);
        }
        if ($request->filled('id_sub_kategori')) {
            $query->where('id_sub_kategori', $request->id_sub_kategori);
        }
        
        $query->latest('id_m_barang');

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
     * Mengambil rincian stok berdasarkan nama barang lalu warna
     * untuk semua item yang memiliki kode_barang (SKU) yang sama.
     */
    public function getStockBreakdown(MasterBarang $masterBarang)
    {
        $statusTersediaId = \App\Models\Status::where('nama_status', 'Tersedia')->value('id');
        if (!$statusTersediaId) {
            return response()->json([]);
        }

        $relatedMasterBarangIds = MasterBarang::where('kode_barang', $masterBarang->kode_barang)
                                            ->pluck('id_m_barang');

        $stockData = StokBarang::whereIn('master_barang_id', $relatedMasterBarangIds)
            ->where('status_id', $statusTersediaId)
            ->join('master_barangs', 'stok_barangs.master_barang_id', '=', 'master_barangs.id_m_barang')
            ->leftJoin('colors', 'stok_barangs.id_warna', '=', 'colors.id_warna')
            ->select(
                'master_barangs.nama_barang',
                'colors.nama_warna',
                DB::raw('count(stok_barangs.id) as total')
            )
            ->groupBy('master_barangs.nama_barang', 'colors.nama_warna')
            ->orderBy('master_barangs.nama_barang')
            ->get();

        $result = [];
        foreach ($stockData as $stock) {
            if (!isset($result[$stock->nama_barang])) {
                $result[$stock->nama_barang] = [
                    'item_name' => $stock->nama_barang,
                    'total_stock' => 0,
                    'colors' => [],
                ];
            }

            $result[$stock->nama_barang]['colors'][] = [
                'color_name' => $stock->nama_warna ?? 'Tanpa Warna',
                'count' => (int) $stock->total,
            ];

            $result[$stock->nama_barang]['total_stock'] += (int) $stock->total;
        }

        return response()->json(array_values($result));
    }

    /**
     * Menampilkan satu tipe barang (MasterBarang) spesifik.
     */
    public function show(MasterBarang $masterBarang)
    {
        return $masterBarang->load(['masterKategori', 'subKategori']);
    }

    public function getStockByColor(MasterBarang $masterBarang)
    {
        $excludedStatuses = DB::table('status_barang')
            ->whereIn('nama_status', ['Hilang', 'Rusak', 'Digunakan'])
            ->pluck('id');

        $stockDetails = $masterBarang->stokBarangs()
            ->whereNotIn('stok_barangs.status_id', $excludedStatuses)
            // Ganti dari 'join' menjadi 'leftJoin'
            ->leftJoin('colors', 'stok_barangs.id_warna', '=', 'colors.id_warna')
            // Gunakan COALESCE untuk menangani warna NULL
            ->select(
                DB::raw('COALESCE(colors.nama_warna, "Tanpa Warna") as nama_warna'),
                DB::raw('count(*) as total')
            )
            ->groupBy(DB::raw('COALESCE(colors.nama_warna, "Tanpa Warna")'))
            ->get();

        return response()->json($stockDetails);
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

    public function bulkDelete(Request $request)
    {
        // 1. Validasi input
        $validated = $request->validate([
            'ids' => 'required|array|min:1',
            'ids.*' => 'integer|exists:master_barangs,id_m_barang',
        ]);

        $allIds = $validated['ids'];

        $idsWithStock = MasterBarang::whereIn('id_m_barang', $allIds)
                                  ->has('stokBarangs') 
                                  ->pluck('id_m_barang')
                                  ->all();

        $idsToDelete = array_diff($allIds, $idsWithStock);

        $deletedCount = 0;
        if (count($idsToDelete) > 0) {
            $deletedCount = MasterBarang::whereIn('id_m_barang', $idsToDelete)->delete();
        }

        $skippedCount = count($allIds) - $deletedCount;
        $message = $deletedCount . ' SKU berhasil dihapus.';
        if ($skippedCount > 0) {
            $message .= ' ' . $skippedCount . ' SKU tidak dapat dihapus karena masih memiliki stok fisik terkait.';
        }

        return response()->json(['message' => $message]);
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
