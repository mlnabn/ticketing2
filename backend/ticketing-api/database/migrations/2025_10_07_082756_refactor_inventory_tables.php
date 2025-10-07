<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // 1. Mengubah tabel stok_barangs
        Schema::table('stok_barangs', function (Blueprint $table) {
            // Menambahkan kolom baru
            $table->decimal('harga_beli', 15, 2)->default(0.00)->after('serial_number');
            $table->string('warna')->nullable()->after('harga_beli');

            // Memastikan kolom tanggal_pembelian ada dan nullable (sudah benar)
            $table->date('tanggal_pembelian')->nullable()->change();
            
            // PERBAIKAN: Tetap gunakan tipe 'date' untuk konsistensi
            $table->date('tanggal_masuk')->nullable()->change();
        });

        // 2. Mengubah tabel master_barangs
        Schema::table('master_barangs', function (Blueprint $table) {
            // Menghapus kolom yang tidak lagi relevan
            // Catatan Anda sebelumnya kurang tepat, kolom-kolom ini memang ada dan perlu dihapus.
            $table->dropColumn(['status', 'warna', 'tanggal_pembelian', 'tanggal_masuk', 'digunakan_untuk']);
        });
    }

    public function down(): void
    {
        // Logika untuk membatalkan (rollback) perubahan
        Schema::table('master_barangs', function (Blueprint $table) {
            // PERBAIKAN: Kembalikan SEMUA kolom yang dihapus
            $table->string('status')->default('Tersedia')->after('harga_barang');
            $table->string('warna')->nullable()->after('status');
            $table->date('tanggal_pembelian')->nullable()->after('warna');
            $table->date('tanggal_masuk')->nullable()->after('tanggal_pembelian');
            $table->string('digunakan_untuk')->nullable()->after('tanggal_masuk');
        });

        Schema::table('stok_barangs', function (Blueprint $table) {
            // Ini sudah benar
            $table->dropColumn(['harga_beli', 'warna']);
        });
    }
};