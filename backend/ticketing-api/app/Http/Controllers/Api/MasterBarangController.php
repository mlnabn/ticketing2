<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\MasterBarang;
use App\Models\StokBarang;
use App\Models\MasterKategori;
use App\Models\SubKategori;
use App\Models\Status;
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
        $isActive = $request->input('is_active', 'true') === 'true';

        $query = MasterBarang::query()
            ->join('master_kategoris', 'master_barangs.id_kategori', '=', 'master_kategoris.id_kategori')
            ->join('sub_kategoris', 'master_barangs.id_sub_kategori', '=', 'sub_kategoris.id_sub_kategori')
            ->select(
                'master_barangs.kode_barang',
                'master_kategoris.nama_kategori',
                'sub_kategoris.nama_sub',
                DB::raw('COUNT(master_barangs.id_m_barang) as variations_count')
            )
            ->where('master_barangs.is_active', $isActive)
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
            $query->withCount([
                'stokBarangs as stok_tersedia' => function ($q) {
                    $q->where('status_id', 1);
                }
            ]);
        }
        $query->latest('master_barangs.kode_barang');
        if ($request->has('all')) {
            return $query->get();
        }

        $paginator = $query->paginate(15);
        return $paginator;
    }

    private function getVariationsData($kode_barang, $isActive = true)
    {
        $tersediaStatusId = 1;
        $endOfLifeStatuses = Status::whereIn('nama_status', ['Rusak', 'Hilang', 'Non-Aktif'])->pluck('id');

        $items = MasterBarang::where('kode_barang', $kode_barang)
            ->where('is_active', $isActive)
            ->with(['masterKategori', 'subKategori'])
            ->withCount([
                'stokBarangs as stok_tersedia_count' => function ($query) use ($tersediaStatusId) {
                    $query->where('status_id', $tersediaStatusId);
                },
                'stokBarangs as total_stock'
            ])
            ->withCount(['activeStokBarangs as total_active_stock'])
            ->orderBy('nama_barang', 'asc')
            ->get();

        return $items;
    }

    public function getVariations($kode_barang, Request $request)
    {
        $isActive = $request->input('is_active', 'true') === 'true';
        $items = $this->getVariationsData($kode_barang, $isActive);
        return response()->json($items);
    }

    public function indexFlat(Request $request)
    {
        $query = MasterBarang::with(['masterKategori', 'subKategori', 'createdBy'])
            ->withCount('activeStokBarangs as total_active_stock');

        $query->when($request->filled('is_active'), function ($q) use ($request) {
            $q->where('is_active', $request->input('is_active') === 'true');
        }, function ($q) {
            $q->where('is_active', true);
        });

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
        $messages = [
            'required' => ':attribute wajib diisi.',
            'unique' => ':attribute sudah terdaftar.',
        ];

        $attributes = [
            'id_kategori' => 'Kategori',
            'id_sub_kategori' => 'Sub Kategori',
            'nama_barang' => 'Nama Barang',
        ];

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
        ], $messages, $attributes);

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
            'is_active' => true,
        ]);

        $masterBarang = MasterBarang::create($dataToCreate);

        return response()->json($masterBarang->load(['masterKategori', 'subKategori']), 201);
    }

    public function getStockBreakdown(MasterBarang $masterBarang)
    {
        $targetMasterBarangId = $masterBarang->id_m_barang;

        $allStatuses = Status::all()->keyBy('id');

        $activeStatusNames = ['Tersedia', 'Dipinjam', 'Digunakan', 'Perbaikan'];
        $inactiveStatusNames = ['Rusak', 'Hilang', 'Non-Aktif'];

        $stockData = StokBarang::where('master_barang_id', $targetMasterBarangId)
            ->join('status_barang', 'stok_barangs.status_id', '=', 'status_barang.id')
            ->leftJoin('colors', 'stok_barangs.id_warna', '=', 'colors.id_warna')
            ->select(
                'status_barang.id as status_id',
                'status_barang.nama_status',
                'status_barang.warna_badge',
                'colors.nama_warna',
                DB::raw('count(stok_barangs.id) as total')
            )
            ->groupBy('status_barang.id', 'status_barang.nama_status', 'status_barang.warna_badge', 'colors.nama_warna')
            ->orderBy('status_barang.id')
            ->get();

        $statusBreakdown = [];
        $totalActive = 0;
        $totalInactive = 0;
        $totalAll = 0;

        foreach ($stockData as $stock) {
            $statusName = $stock->nama_status;
            $isActive = in_array($statusName, $activeStatusNames);

            if (!isset($statusBreakdown[$statusName])) {
                $statusBreakdown[$statusName] = [
                    'status_name' => $statusName,
                    'status_badge' => $stock->warna_badge,
                    'is_active' => $isActive,
                    'total' => 0,
                    'colors' => [],
                ];
            }

            $colorName = $stock->nama_warna ?? 'Tanpa Warna';
            $count = (int) $stock->total;

            $colorExists = false;
            foreach ($statusBreakdown[$statusName]['colors'] as &$color) {
                if ($color['color_name'] === $colorName) {
                    $color['count'] += $count;
                    $colorExists = true;
                    break;
                }
            }
            if (!$colorExists) {
                $statusBreakdown[$statusName]['colors'][] = [
                    'color_name' => $colorName,
                    'count' => $count,
                ];
            }

            $statusBreakdown[$statusName]['total'] += $count;
            $totalAll += $count;

            if ($isActive) {
                $totalActive += $count;
            } else {
                $totalInactive += $count;
            }
        }

        $activeStatuses = [];
        $inactiveStatuses = [];

        foreach ($statusBreakdown as $status) {
            if ($status['is_active']) {
                $activeStatuses[] = $status;
            } else {
                $inactiveStatuses[] = $status;
            }
        }

        return response()->json([
            'item_name' => $masterBarang->nama_barang,
            'total_all' => $totalAll,
            'total_active' => $totalActive,
            'total_inactive' => $totalInactive,
            'active_statuses' => $activeStatuses,
            'inactive_statuses' => $inactiveStatuses,
        ]);
    }

    public function show(MasterBarang $masterBarang)
    {
        return $masterBarang->load(['masterKategori', 'subKategori']);
    }

    public function getStockByColor(MasterBarang $masterBarang)
    {
        $excludedStatuses = DB::table('status_barang')
            ->whereIn('nama_status', ['Hilang', 'Rusak', 'Digunakan', 'Non-Aktif'])
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
        } else {
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
            if ($s2 == 0)
                $baseCode = $code;
            if (!$this->checkCodeExists($code))
                return $code;
        }

        for ($s1 = 1; $s1 < $maxSub1; $s1++) {
            for ($s2 = 0; $s2 < $maxSub2; $s2++) {
                $catInisial = $this->getInisial($kategoriNama, 0, 0);
                $subInisial = $this->getInisial($subKategoriNama, $s1, $s2);
                $code = $catInisial . $subInisial;
                if (!$this->checkCodeExists($code))
                    return $code;
            }
        }

        for ($c1 = 1; $c1 < $maxCat1; $c1++) {
            for ($c2 = 0; $c2 < $maxCat2; $c2++) {
                for ($s1 = 0; $s1 < $maxSub1; $s1++) {
                    for ($s2 = 0; $s2 < $maxSub2; $s2++) {
                        $catInisial = $this->getInisial($kategoriNama, $c1, $c2);
                        $subInisial = $this->getInisial($subKategoriNama, $s1, $s2);
                        $code = $catInisial . $subInisial;
                        if (!$this->checkCodeExists($code))
                            return $code;
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
        $messages = [
            'required' => ':attribute wajib diisi.',
            'unique' => ':attribute sudah terdaftar.',
        ];

        $attributes = [
            'nama_barang' => 'Nama Barang',
        ];

        $validated = $request->validate([
            'nama_barang' => ['required', 'string', 'max:255', Rule::unique('master_barangs')->ignore($masterBarang->id_m_barang, 'id_m_barang')],
        ], $messages, $attributes);
        $masterBarang->update($validated);
        return response()->json($masterBarang);
    }

    public function archive(MasterBarang $masterBarang)
    {
        if ($masterBarang->activeStokBarangs()->exists()) {
            return response()->json(['message' => 'SKU tidak dapat diarsipkan. Masih ada unit yang berstatus Tersedia, Dipinjam, Digunakan, atau Perbaikan.'], 422);
        }

        $masterBarang->update(['is_active' => false]);
        return response()->json(['message' => 'SKU berhasil diarsipkan.']);
    }

    public function restore(MasterBarang $masterBarang)
    {
        $masterBarang->update(['is_active' => true]);
        return response()->json(['message' => 'SKU berhasil dipulihkan.']);
    }

    public function bulkDelete(Request $request)
    {
        $validated = $request->validate([
            'ids' => 'required|array|min:1',
            'ids.*' => 'integer|exists:master_barangs,id_m_barang',
        ]);

        $allIds = $validated['ids'];

        $idsWithActiveStock = MasterBarang::whereIn('id_m_barang', $allIds)
            ->has('activeStokBarangs')
            ->pluck('id_m_barang')
            ->all();

        $idsToArchive = array_diff($allIds, $idsWithActiveStock);

        $archivedCount = 0;
        if (count($idsToArchive) > 0) {
            $archivedCount = MasterBarang::whereIn('id_m_barang', $idsToArchive)
                ->update(['is_active' => false]);
        }

        $skippedCount = count($allIds) - $archivedCount;
        $message = $archivedCount . ' SKU berhasil diarsipkan.';
        if ($skippedCount > 0) {
            $message .= ' ' . $skippedCount . ' SKU tidak dapat diarsipkan karena masih memiliki stok aktif (Tersedia, Dipinjam, dll).';
        }

        return response()->json(['message' => $message]);
    }

    public function bulkRestore(Request $request)
    {
        $validated = $request->validate([
            'ids' => 'required|array|min:1',
            'ids.*' => 'integer|exists:master_barangs,id_m_barang',
        ]);

        $restoredCount = MasterBarang::whereIn('id_m_barang', $validated['ids'])
            ->update(['is_active' => true]);

        return response()->json(['message' => $restoredCount . ' SKU berhasil dipulihkan.']);
    }

    public function destroy(MasterBarang $masterBarang)
    {
        if ($masterBarang->activeStokBarangs()->exists()) {
            return response()->json(['message' => 'SKU tidak dapat diarsipkan. Masih ada unit yang berstatus Tersedia, Dipinjam, Digunakan, atau Perbaikan.'], 422);
        }

        $masterBarang->update(['is_active' => false]);
        return response()->json(['message' => 'SKU barang berhasil diarsipkan.'], 200);
    }
}