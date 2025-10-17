<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\StokBarang;
use App\Models\MasterBarang;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;
use Carbon\Carbon;

class StokBarangController extends Controller
{
    public function index(Request $request)
    {
        $excludedStatuses = DB::table('status_barang')
            ->whereIn('nama_status', ['Hilang', 'Rusak', 'Digunakan'])
            ->pluck('id');
        
        $query = StokBarang::with([
            'masterBarang' => function ($query) use ($excludedStatuses) {
                    $query->withCount(['stokBarangs' => function ($q) use ($excludedStatuses) {
                    $q->whereNotIn('status_id', $excludedStatuses);
                }]);
            },
            'masterBarang.masterKategori',
            'masterBarang.subKategori',
            'userPeminjam',
            'workshop',
            'statusDetail',
            'createdBy',
            'updatedBy',
            'color',
            'teknisiPerbaikan',
            'userPerusak',
            'userPenghilang'
        ]);

        if ($request->filled('id_kategori')) {
            $query->whereHas('masterBarang', fn($q) => $q->where('id_kategori', $request->id_kategori));
        }
        if ($request->filled('id_sub_kategori')) {
            $query->whereHas('masterBarang', fn($q) => $q->where('id_sub_kategori', $request->id_sub_kategori));
        }
        if ($request->filled('status_id')) {
            $query->where('status_id', $request->status_id);
        }
        if ($request->filled('id_warna')) {
            $query->where('id_warna', $request->id_warna);
        }
        if ($request->filled('search')) {
            $searchTerm = $request->search;
            $query->where(function ($q) use ($searchTerm) {
                // Cari di kolom tabel stok_barangs
                $q->where('kode_unik', 'LIKE', "%{$searchTerm}%")
                ->orWhere('serial_number', 'LIKE', "%{$searchTerm}%")
                ->orWhere('kondisi', 'LIKE', "%{$searchTerm}%");

                // Cari di relasi masterBarang (untuk nama barang)
                $q->orWhereHas('masterBarang', function ($q2) use ($searchTerm) {
                    $q2->where('nama_barang', 'LIKE', "%{$searchTerm}%");
                });

                // Cari di relasi createdBy (untuk nama admin)
                $q->orWhereHas('createdBy', function ($q3) use ($searchTerm) {
                    $q3->where('name', 'LIKE', "%{$searchTerm}%");
                });
            });
        }

        return $query->latest()->paginate(10);
    }

    public function show(StokBarang $stokBarang)
    {
        // Muat semua relasi yang diperlukan oleh frontend
        return response()->json($stokBarang->load([
            'masterBarang.masterKategori',
            'masterBarang.subKategori',
            'userPeminjam',
            'workshop',
            'statusDetail'
        ]));
    }

    public function update(Request $request, StokBarang $stokBarang)
    {
        $validated = $request->validate([
            'serial_number' => [
                'nullable',
                'string',
                'max:255',
                Rule::unique('stok_barangs')->ignore($stokBarang->id),
            ],
            'status_id' => 'required|exists:status_barang,id',
            'tanggal_pembelian' => 'nullable|date',
            'tanggal_masuk' => 'nullable|date',
            'harga_beli' => 'required|numeric|min:0',
            'kondisi' => 'required|in:Baru,Bekas',
            'id_warna' => 'nullable|exists:colors,id_warna',
        ]);

        // PERBAIKAN 2: Tambahkan ID admin yang melakukan update
        $validated['updated_by'] = Auth::id();

        $stokBarang->update($validated);

        return response()->json($stokBarang->load(['masterBarang.masterKategori', 'masterBarang.subKategori']));
    }

    public function showBySerial($code)
    {
        // PERBAIKAN: Tambahkan with() untuk memuat relasi saat mencari via serial number
        $item = StokBarang::with([
            'masterBarang.masterKategori',
            'masterBarang.subKategori',
            'userPeminjam',
            'workshop',
            'statusDetail'
        ])
            ->where('kode_unik', $code)
            ->orWhere('serial_number', $code)
            ->firstOrFail();

        return response()->json($item);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'master_barang_id' => 'required|exists:master_barangs,id_m_barang',
            'jumlah' => 'required|integer|min:1',
            'harga_beli' => 'required|numeric|min:0',
            'kondisi' => 'required|in:Baru,Bekas',
            'id_warna' => 'nullable|exists:colors,id_warna',
            'tanggal_pembelian' => 'nullable|date',
            'tanggal_masuk' => 'required|date',
            'serial_numbers' => 'nullable|array',
            'serial_numbers.*' => 'nullable|string|unique:stok_barangs,serial_number',
        ]);

        $masterBarang = MasterBarang::find($validated['master_barang_id']);

        $createdItems = [];

        DB::transaction(function () use ($validated, $masterBarang, &$createdItems) {
            $statusTersediaId = DB::table('status_barang')->where('nama_status', 'Tersedia')->value('id');
            for ($i = 0; $i < $validated['jumlah']; $i++) {
                $newItem = StokBarang::create([
                    'master_barang_id' => $masterBarang->id_m_barang,
                    'kode_unik' => $this->generateUniqueStokCode($masterBarang),
                    'serial_number' => $validated['serial_numbers'][$i] ?? null,
                    'harga_beli' => $validated['harga_beli'],
                    'id_warna' => $validated['id_warna'] ?? null,
                    'kondisi' => $validated['kondisi'],
                    'status_id' => $statusTersediaId,
                    'tanggal_pembelian' => $validated['tanggal_pembelian'] ?? now(),
                    'tanggal_masuk' => $validated['tanggal_masuk'] ?? now(),
                    'created_by' => auth()->id()
                ]);
                
                $createdItems[] = $newItem->load('masterBarang');
            }
        });

        return response()->json($createdItems, 201);
    }

    private function generateUniqueStokCode(MasterBarang $masterBarang): string
    {
        $baseCode = $masterBarang->kode_barang;

        $latestItem = StokBarang::where('kode_unik', 'LIKE', $baseCode . '%')
            ->orderBy('kode_unik', 'desc')
            ->first();

        $sequence = 1;
        if ($latestItem) {
            $lastSequence = (int) substr($latestItem->kode_unik, strlen($baseCode));
            $sequence = $lastSequence + 1;
        }

        $padding = ($sequence >= 10000) ? 5 : 4;
        $sequencePart = str_pad($sequence, $padding, '0', STR_PAD_LEFT);

        return $baseCode . $sequencePart; 
    }

    public function updateStatus(Request $request, StokBarang $stokBarang)
    {
        $validated = $request->validate([
            'status_id' => 'required|exists:status_barang,id',
            'deskripsi' => 'nullable|string',
            'user_peminjam_id' => 'required_if_status:Digunakan,Dipinjam|nullable|exists:users,id',
            'workshop_id' => 'required_if_status:Digunakan,Dipinjam|nullable|exists:workshops,id',
            'tanggal_keluar' => 'nullable|date',
            'teknisi_perbaikan_id' => 'required_if_status:Perbaikan|nullable|exists:users,id',
            'tanggal_mulai_perbaikan' => 'nullable|date',
            'tanggal_selesai_perbaikan' => 'nullable|date|after_or_equal:tanggal_mulai_perbaikan',
            'user_perusak_id' => 'required_if_status:Rusak|nullable|exists:users,id',
            'tanggal_rusak' => 'nullable|date',
            'user_penghilang_id' => 'required_if_status:Hilang|nullable|exists:users,id',
            'tanggal_hilang' => 'nullable|date',
            'tanggal_ketemu' => 'nullable|date|after_or_equal:tanggal_hilang',
        ]);

        $status = \App\Models\Status::find($validated['status_id']);

        DB::transaction(function () use ($stokBarang, $validated, $status, $request) {
            // --- 1. LOGIKA BARU: Tentukan Tanggal Kejadian ---
            $eventDate = null;
            switch ($status->nama_status) {
                case 'Digunakan':
                case 'Dipinjam':
                    // [PERBAIKAN 2] Gunakan logika yang sama seperti status lain
                    $eventDate = $request->filled('tanggal_keluar') ? Carbon::parse($validated['tanggal_keluar']) : now();
                    break;
                case 'Perbaikan':
                    $eventDate = $request->filled('tanggal_mulai_perbaikan') ? Carbon::parse($validated['tanggal_mulai_perbaikan']) : now();
                    break;
                case 'Rusak':
                    $eventDate = $request->filled('tanggal_rusak') ? Carbon::parse($validated['tanggal_rusak']) : now();
                    break;
                case 'Hilang':
                    $eventDate = $request->filled('tanggal_hilang') ? Carbon::parse($validated['tanggal_hilang']) : now();
                    break;
                default:
                    $eventDate = now();
                    break;
            }

            // --- 2. PERSIAPAN DATA UPDATE (TETAP SAMA) ---
            $updateData = [
                'status_id' => $validated['status_id'],
                'deskripsi' => $validated['deskripsi'] ?? $stokBarang->deskripsi,
            ];

            // Reset semua kolom tracking terlebih dahulu
            $allTrackingColumns = [
                'user_peminjam_id', 'workshop_id', 'tanggal_keluar', 'teknisi_perbaikan_id',
                'tanggal_mulai_perbaikan', 'tanggal_selesai_perbaikan', 'user_perusak_id',
                'tanggal_rusak', 'user_penghilang_id', 'tanggal_hilang', 'tanggal_ketemu',
            ];
            foreach ($allTrackingColumns as $col) {
                $updateData[$col] = null;
            }

            // --- 3. PENGISIAN DATA DENGAN TANGGAL KEJADIAN ---
            switch ($status->nama_status) {
                case 'Digunakan':
                case 'Dipinjam':
                    $updateData['user_peminjam_id'] = $validated['user_peminjam_id'];
                    $updateData['workshop_id'] = $validated['workshop_id'];
                    $updateData['tanggal_keluar'] = $eventDate; 
                    break;
                case 'Perbaikan':
                    $updateData['teknisi_perbaikan_id'] = $validated['teknisi_perbaikan_id'];
                    $updateData['tanggal_mulai_perbaikan'] = $eventDate; 
                    $updateData['tanggal_selesai_perbaikan'] = $validated['tanggal_selesai_perbaikan'] ?? null;
                    break;
                case 'Rusak':
                    $updateData['user_perusak_id'] = $validated['user_perusak_id'];
                    $updateData['tanggal_rusak'] = $eventDate;
                    break;
                case 'Hilang':
                    $updateData['user_penghilang_id'] = $validated['user_penghilang_id'];
                    $updateData['tanggal_hilang'] = $eventDate; 
                    $updateData['tanggal_ketemu'] = $validated['tanggal_ketemu'] ?? null;
                    break;
            }

            $stokBarang->update($updateData);

            // --- 4. PERSIAPAN DATA RIWAYAT ---
            $relatedUserId = null;
            switch ($status->nama_status) {
                case 'Digunakan': case 'Dipinjam': $relatedUserId = $validated['user_peminjam_id'] ?? null; break;
                case 'Perbaikan': $relatedUserId = $validated['teknisi_perbaikan_id'] ?? null; break;
                case 'Rusak': $relatedUserId = $validated['user_perusak_id'] ?? null; break;
                case 'Hilang': $relatedUserId = $validated['user_penghilang_id'] ?? null; break;
            }

            // --- 5. PEMBUATAN RIWAYAT DENGAN TANGGAL KUSTOM ---
            $historyData = [
                'status_id' => $validated['status_id'],
                'deskripsi' => $validated['deskripsi'] ?? null,
                'triggered_by_user_id' => Auth::id(),
                'related_user_id' => $relatedUserId,
                'workshop_id' => $validated['workshop_id'] ?? null,
                // 'created_at' => $eventDate,
                // 'updated_at' => $eventDate,
                'event_date' => $eventDate,
            ];
            
            $stokBarang->histories()->create($historyData);

        });

        return response()->json($stokBarang->load([
            'masterBarang', 'userPeminjam', 'workshop', 'statusDetail',
            'teknisiPerbaikan', 'userPerusak', 'userPenghilang'
        ]));
    }

    public function getHistory(StokBarang $stokBarang)
    {
        $history = $stokBarang->histories()->with([
            'statusDetail',
            'triggeredByUser:id,name', 
            'relatedUser:id,name',
            'workshop:id,name'
        ])->get();

        return response()->json($history);
    }

    // Helper untuk validasi custom (tambahkan ini di file yang sama)
    public function __construct()
    {
        \Illuminate\Support\Facades\Validator::extend('required_if_status', function ($attribute, $value, $parameters, $validator) {
            $statusId = $validator->getData()['status_id'] ?? null;
            if (!$statusId) return true; // Lewati jika tidak ada status_id

            $status = \App\Models\Status::find($statusId);
            if ($status && in_array($status->nama_status, $parameters)) {
                return !empty($value);
            }
            return true;
        });
    }

    public function findAvailableByCode($code)
    {
        $statusTersediaId = \App\Models\Status::where('nama_status', 'Tersedia')->value('id');

        $item = StokBarang::with('masterBarang')
            ->where(function ($query) use ($code) {
                $query->where('kode_unik', $code)
                      ->orWhere('serial_number', $code);
            })
            ->where('status_id', $statusTersediaId)
            ->first();

        if (!$item) {
            return response()->json(['message' => 'Barang tidak ditemukan atau tidak tersedia.'], 404);
        }

        return response()->json($item);
    }

    public function searchAvailable(Request $request)
    {
        $request->validate(['search' => 'required|string|min:2']);
        $searchTerm = '%' . $request->search . '%';

        $statusTersediaId = \App\Models\Status::where('nama_status', 'Tersedia')->value('id');

        $results = StokBarang::with('masterBarang')
            ->where('status_id', $statusTersediaId)
            ->where(function ($query) use ($searchTerm) {
                $query->where('kode_unik', 'like', $searchTerm)
                      ->orWhere('serial_number', 'like', $searchTerm)
                      ->orWhereHas('masterBarang', function ($q) use ($searchTerm) {
                          $q->where('nama_barang', 'like', $searchTerm);
                      });
            })
            ->limit(10) // Batasi hasil agar dropdown tidak terlalu panjang
            ->get();

        return response()->json($results);
    }
}
