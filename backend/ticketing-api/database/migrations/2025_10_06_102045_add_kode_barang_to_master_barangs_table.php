<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::table('master_barangs', function (Blueprint $table) {
            $table->string('kode_barang', 10)->nullable()->after('id_sub_kategori');
            // Pastikan harga_barang tidak null karena jadi bagian dari kunci identifikasi
            $table->decimal('harga_barang', 15, 2)->nullable(false)->default(0)->change();
        });
    }
    public function down(): void {
        Schema::table('master_barangs', function (Blueprint $table) {
            $table->dropColumn('kode_barang');
            $table->decimal('harga_barang', 15, 2)->nullable()->change();
        });
    }
};