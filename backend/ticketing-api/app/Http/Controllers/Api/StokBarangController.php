<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\StokBarang;
use App\Models\MasterBarang;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;

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

        return $query->latest()->paginate(25);
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

    public function showBySerial($serial)
    {
        // PERBAIKAN: Tambahkan with() untuk memuat relasi saat mencari via serial number
        $item = StokBarang::with([
            'masterBarang.masterKategori',
            'masterBarang.subKategori',
            'userPeminjam',
            'workshop',
            'statusDetail'
        ])
            ->where('serial_number', $serial)
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

        DB::transaction(function () use ($validated, $masterBarang) {
            $statusTersediaId = DB::table('status_barang')->where('nama_status', 'Tersedia')->value('id');
            for ($i = 0; $i < $validated['jumlah']; $i++) {
                StokBarang::create([
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
            }
        });

        return response()->json(['message' => 'Stok berhasil ditambahkan.'], 201);
    }

    private function generateUniqueStokCode(MasterBarang $masterBarang): string
    {
        // --- LOGIKA BARU DIMULAI DI SINI ---

        // 1. Ambil kode dasar dari master barang, contoh: "RUZT"
        $baseCode = $masterBarang->kode_barang;

        // 2. Cari stok terakhir dengan awalan kode yang sama untuk mendapatkan urutan
        $latestItem = StokBarang::where('kode_unik', 'LIKE', $baseCode . '%')
            ->orderBy('kode_unik', 'desc')
            ->first();

        $sequence = 1;
        if ($latestItem) {
            // Ekstrak angka dari kode unik terakhir (misal: dari RUZT0001 -> 1)
            $lastSequence = (int) substr($latestItem->kode_unik, strlen($baseCode));
            $sequence = $lastSequence + 1;
        }

        // 3. Tentukan jumlah digit (padding) berdasarkan urutan
        $padding = ($sequence >= 10000) ? 5 : 4;
        $sequencePart = str_pad($sequence, $padding, '0', STR_PAD_LEFT); // Contoh: 0001 atau 00001

        // 4. Gabungkan menjadi kode unik final
        return $baseCode . $sequencePart; // Contoh: "RUZT0001"
    }

    public function updateStatus(Request $request, StokBarang $stokBarang)
    {
        $validated = $request->validate([
            'status_id' => 'required|exists:status_barang,id',
            'deskripsi' => 'nullable|string',

            // Validasi untuk status 'Digunakan' & 'Dipinjam'
            'user_peminjam_id' => 'required_if_status:Digunakan,Dipinjam|nullable|exists:users,id',
            'workshop_id' => 'required_if_status:Digunakan,Dipinjam|nullable|exists:workshops,id',

            // Validasi untuk 'Perbaikan'
            'teknisi_perbaikan_id' => 'required_if_status:Perbaikan|nullable|exists:users,id',
            'tanggal_mulai_perbaikan' => 'required_if_status:Perbaikan|nullable|date',
            'tanggal_selesai_perbaikan' => 'nullable|date|after_or_equal:tanggal_mulai_perbaikan',

            // Validasi untuk 'Rusak'
            'user_perusak_id' => 'required_if_status:Rusak|nullable|exists:users,id',
            'tanggal_rusak' => 'required_if_status:Rusak|nullable|date',

            // Validasi untuk 'Hilang'
            'user_penghilang_id' => 'required_if_status:Hilang|nullable|exists:users,id',
            'tanggal_hilang' => 'required_if_status:Hilang|nullable|date',
            'tanggal_ketemu' => 'nullable|date|after_or_equal:tanggal_hilang',
        ]);

        // Ambil nama status untuk logika switch
        $status = \App\Models\Status::find($validated['status_id']);

        // Siapkan data update dasar
        $updateData = [
            'status_id' => $validated['status_id'],
            'deskripsi' => $validated['deskripsi'] ?? $stokBarang->deskripsi,
        ];

        // Logika untuk membersihkan data lama saat status berubah
        $allTrackingColumns = [
            'user_peminjam_id',
            'workshop_id',
            'tanggal_keluar',
            'teknisi_perbaikan_id',
            'tanggal_mulai_perbaikan',
            'tanggal_selesai_perbaikan',
            'user_perusak_id',
            'tanggal_rusak',
            'user_penghilang_id',
            'tanggal_hilang',
            'tanggal_ketemu',
        ];
        foreach ($allTrackingColumns as $col) {
            $updateData[$col] = null;
        }

        // Isi data baru berdasarkan status yang dipilih
        switch ($status->nama_status) {
            case 'Digunakan':
            case 'Dipinjam':
                $updateData['user_peminjam_id'] = $validated['user_peminjam_id'];
                $updateData['workshop_id'] = $validated['workshop_id'];
                $updateData['tanggal_keluar'] = now();
                break;
            case 'Perbaikan':
                $updateData['teknisi_perbaikan_id'] = $validated['teknisi_perbaikan_id'];
                $updateData['tanggal_mulai_perbaikan'] = $validated['tanggal_mulai_perbaikan'];
                $updateData['tanggal_selesai_perbaikan'] = $validated['tanggal_selesai_perbaikan'] ?? null;
                break;
            case 'Rusak':
                $updateData['user_perusak_id'] = $validated['user_perusak_id'];
                $updateData['tanggal_rusak'] = $validated['tanggal_rusak'];
                break;
            case 'Hilang':
                $updateData['user_penghilang_id'] = $validated['user_penghilang_id'];
                $updateData['tanggal_hilang'] = $validated['tanggal_hilang'];
                $updateData['tanggal_ketemu'] = $validated['tanggal_ketemu'] ?? null;
                break;
        }

        $stokBarang->update($updateData);

        // Muat semua relasi baru untuk dikirim kembali ke frontend
        return response()->json($stokBarang->load([
            'masterBarang',
            'userPeminjam',
            'workshop',
            'statusDetail',
            'teknisiPerbaikan',
            'userPerusak',
            'userPenghilang'
        ]));
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
}
