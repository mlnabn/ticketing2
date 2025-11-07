<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // Masukkan status "Non-Aktif" (atau "Dihanguskan")
        DB::table('status_barang')->insert([
            'id' => 7, // Pastikan ID ini tersedia (setelah 'Dipinjam' (ID 6))
            'nama_status' => 'Non-Aktif', // Atau 'Dihanguskan'
            'warna_badge' => 'black',
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    }

    public function down(): void
    {
        DB::table('status_barang')->where('nama_status', '=', 'Non-Aktif')->delete();
    }
};