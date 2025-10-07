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
        $query = StokBarang::with([
            
            'masterBarang' => function ($query) {
                $query->withCount('stokBarangs');
            },
            'masterBarang.masterKategori', 
           
            'masterBarang.subKategori',
            'userPeminjam',
            'workshop',
            'statusDetail'
        ,
            'createdBy',
            'updatedBy'
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
            'warna' => 'nullable|string|max:255'
        ]);

        // PERBAIKAN 2: Tambahkan ID admin yang melakukan update
        $validated['updated_by'] = Auth::id();

        $stokBarang->update($validated);

        return response()->json($stokBarang->load(['masterBarang.masterKategori', 'masterBarang.subKategori']));
    }
    
    public function showBySerial($serial) {
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
            'warna' => 'nullable|string|max:255',
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
                    'warna' => $validated['warna'] ?? null,
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

    public function checkout(Request $request, StokBarang $stokBarang)
    {
        $validated = $request->validate([
            'status_id' => 'required|exists:status_barang,id',
            'user_peminjam_id' => 'required_if:status,Digunakan|nullable|exists:users,id',
            'workshop_id' => 'required_if:status,Digunakan|nullable|exists:workshops,id',
        ]);

        $stokBarang->status = $validated['status'];

        if ($validated['status_id'] == 2) { // Asumsi ID 'Digunakan' adalah 2
            $stokBarang->user_peminjam_id = $validated['user_peminjam_id'];
            $stokBarang->workshop_id = $validated['workshop_id'];
            $stokBarang->tanggal_keluar = now();
        } else {
            // Jika status diubah kembali ke 'Tersedia' atau lainnya, hapus data peminjam
            $stokBarang->user_peminjam_id = null;
            $stokBarang->workshop_id = null;
            $stokBarang->tanggal_keluar = null;
        }

        $stokBarang->save();
        
        // Muat semua relasi yang mungkin ditampilkan di frontend
        return response()->json($stokBarang->load([
            'masterBarang.masterKategori', 
            'masterBarang.subKategori', 
            'userPeminjam', // Relasi baru
            'workshop'      // Relasi baru
        ]));
    }
}
