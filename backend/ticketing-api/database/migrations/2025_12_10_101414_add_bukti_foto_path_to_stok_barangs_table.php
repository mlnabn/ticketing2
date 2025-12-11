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
            // Menambahkan kolom setelah deskripsi, nullable karena tidak semua status butuh foto
            $table->string('bukti_foto_path')->nullable()->after('deskripsi');
        });
    }

    public function down(): void
    {
        Schema::table('stok_barangs', function (Blueprint $table) {
            $table->dropColumn('bukti_foto_path');
        });
    }
};
