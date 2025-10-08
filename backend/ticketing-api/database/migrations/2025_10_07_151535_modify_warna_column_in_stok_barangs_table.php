<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('stok_barangs', function (Blueprint $table) {
            // 1. Hapus kolom 'warna' yang lama
            $table->dropColumn('warna');

            // 2. Tambahkan kolom foreign key 'id_warna'
            $table->unsignedBigInteger('id_warna')->nullable()->after('kondisi');
            // 3. Definisikan relasinya
            $table->foreign('id_warna')->references('id_warna')->on('colors');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('stok_barangs', function (Blueprint $table) {
            //
        });
    }
};
