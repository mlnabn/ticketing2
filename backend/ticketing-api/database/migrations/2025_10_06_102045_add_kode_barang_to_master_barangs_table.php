<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('master_barangs', function (Blueprint $table) {
            // Baris untuk menambah 'kode_barang' sudah dihapus.
            // Kita hanya menjalankan perubahan pada kolom 'harga_barang'.
            $table->decimal('harga_barang', 15, 2)->nullable(false)->default(0)->change();
        });
    }
    public function down(): void
    {
        Schema::table('master_barangs', function (Blueprint $table) {
            // $table->dropColumn('kode_barang'); // HAPUS BARIS INI
            $table->decimal('harga_barang', 15, 2)->nullable()->change();
        });
    }
};
