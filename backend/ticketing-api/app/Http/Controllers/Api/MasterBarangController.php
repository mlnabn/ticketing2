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

        if ($request->has('all')) {
            return $query->get();
        }

        return $query->paginate(10); 
    }

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
     * Menyimpan tipe barang baru (MasterBarang).
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

        $existingSkuFamily = MasterBarang::where('id_kategori', $validated['id_kategori'])
            ->where('id_sub_kategori', $validated['id_sub_kategori'])
            ->first();

        $kodeBarang = null;

        if ($existingSkuFamily) {
            $kodeBarang = $existingSkuFamily->kode_barang;
        } else {
            $kategori = MasterKategori::find($validated['id_kategori']);
            $subKategori = SubKategori::find($validated['id_sub_kategori']);

            $kodeBarang = $this->generateUniqueKodeBarang(
                $kategori->nama_kategori,
                $subKategori->nama_sub
            );
        }

        $dataToCreate = array_merge($validated, [
            'kode_barang' => $kodeBarang, 
            'created_by' => Auth::id(),
        ]);

        $masterBarang = MasterBarang::create($dataToCreate);

        return response()->json($masterBarang->load(['masterKategori', 'subKategori']), 201);
    }

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
            ->leftJoin('colors', 'stok_barangs.id_warna', '=', 'colors.id_warna')
            ->select(
                DB::raw('COALESCE(colors.nama_warna, "Tanpa Warna") as nama_warna'),
                DB::raw('count(*) as total')
            )
            ->groupBy(DB::raw('COALESCE(colors.nama_warna, "Tanpa Warna")'))
            ->get();

        return response()->json($stockDetails);
    }

    private function getUniqueChars(string $input): array
    {
        $cleaned = strtoupper(preg_replace('/[^a-zA-Z]/', '', $input));
        if (empty($cleaned)) {
            return ['X']; 
        }
        return array_values(array_unique(str_split($cleaned)));
    }

    private function getInisial(string $nama, int $char1Index, int $char2Index): string
    {
        $words = array_values(array_filter(explode(' ', strtoupper(preg_replace('/[^a-zA-Z\s]/', '', $nama)))));
        if (count($words) == 0) {
            return 'XX';
        }

        $word1Chars = $this->getUniqueChars($words[0]);
        $char1 = $word1Chars[$char1Index % count($word1Chars)] ?? $word1Chars[0];
        $char2 = 'X';
        
        if (count($words) > 1) {
            $word2Chars = $this->getUniqueChars($words[1]);
            $char2 = $word2Chars[$char2Index % count($word2Chars)] ?? $word2Chars[0];
        } 
        else {
            $allChars = $this->getUniqueChars($words[0]);
            $targetIndex = 2 + $char2Index;
            
            if (isset($allChars[$targetIndex])) {
                 $char2 = $allChars[$targetIndex];
            } else {
                 $char2 = $allChars[($targetIndex % count($allChars))] ?? $allChars[min(1, count($allChars) - 1)];
            }
        }
        
        return $char1 . $char2;
    }

    private function generateUniqueKodeBarang(string $kategoriNama, string $subKategoriNama): string
    {
        $catChars1 = $this->getUniqueChars(explode(' ', $kategoriNama)[0] ?? '');
        $subChars1 = $this->getUniqueChars(explode(' ', $subKategoriNama)[0] ?? '');

        $catWords = array_values(array_filter(explode(' ', $kategoriNama)));
        $catChars2 = (count($catWords) > 1) 
            ? $this->getUniqueChars($catWords[1]) 
            : $this->getUniqueChars($catWords[0] ?? '');
        
        $subWords = array_values(array_filter(explode(' ', $subKategoriNama)));
        $subChars2 = (count($subWords) > 1) 
            ? $this->getUniqueChars($subWords[1]) 
            : $this->getUniqueChars($subWords[0] ?? '');
            
        $maxCat1 = count($catChars1);
        $maxCat2 = (count($catWords) > 1) ? count($catChars2) : count($catChars2) - 2;
        $maxSub1 = count($subChars1);
        $maxSub2 = (count($subWords) > 1) ? count($subChars2) : count($subChars2) - 2; 

        $maxCat2 = max(1, $maxCat2);
        $maxSub2 = max(1, $maxSub2); 

        $baseCode = '';
        for ($s2 = 0; $s2 < $maxSub2; $s2++) {
            $catInisial = $this->getInisial($kategoriNama, 0, 0);
            $subInisial = $this->getInisial($subKategoriNama, 0, $s2);
            $code = $catInisial . $subInisial;
            if ($s2 == 0) $baseCode = $code; 
            if (!$this->checkCodeExists($code)) return $code;
        }

        for ($s1 = 1; $s1 < $maxSub1; $s1++) {
            for ($s2 = 0; $s2 < $maxSub2; $s2++) {
                $catInisial = $this->getInisial($kategoriNama, 0, 0);
                $subInisial = $this->getInisial($subKategoriNama, $s1, $s2);
                $code = $catInisial . $subInisial;
                if (!$this->checkCodeExists($code)) return $code;
            }
        }
        
        for ($c1 = 1; $c1 < $maxCat1; $c1++) {
            for ($c2 = 0; $c2 < $maxCat2; $c2++) {
                for ($s1 = 0; $s1 < $maxSub1; $s1++) {
                    for ($s2 = 0; $s2 < $maxSub2; $s2++) {
                        $catInisial = $this->getInisial($kategoriNama, $c1, $c2);
                        $subInisial = $this->getInisial($subKategoriNama, $s1, $s2);
                        $code = $catInisial . $subInisial;
                        if (!$this->checkCodeExists($code)) return $code;
                    }
                }
            }
        }

        $preferredCode = $baseCode ?: ($this->getInisial($kategoriNama, 0, 0) . $this->getInisial($subKategoriNama, 0, 0));
        
        for ($charCode = ord('A'); $charCode <= ord('Z'); $charCode++) {
            $appendedChar = chr($charCode);
            $code5 = $preferredCode . $appendedChar;
            if (!$this->checkCodeExists($code5)) {
                return $code5;
            }
        }
        
         for ($num = 0; $num <= 9; $num++) {
            $code6 = $preferredCode . $num;
            if (!$this->checkCodeExists($code6)) {
                return $code6;
            }
        }
        
        throw new \Exception("Could not generate a unique kode_barang for $kategoriNama / $subKategoriNama after extensive tries.");
    }

    private function checkCodeExists(string $code): bool
    {
        return DB::table('master_barangs')->where('kode_barang', $code)->exists();
    }

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

    public function destroy(MasterBarang $masterBarang)
    {
        if ($masterBarang->stokBarangs()->exists()) {
            return response()->json(['message' => 'SKU barang tidak dapat dihapus karena masih ada stok fisiknya.'], 422);
        }
        $masterBarang->delete();
        return response()->json(['message' => 'SKU barang berhasil dihapus.'], 200);
    }
}