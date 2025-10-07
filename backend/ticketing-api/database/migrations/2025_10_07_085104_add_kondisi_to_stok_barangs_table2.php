<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('stok_barangs', function (Blueprint $table) {
            // Menambahkan kolom kondisi setelah kolom warna
            $table->string('kondisi')->default('Baru')->after('warna');
        });
    }

    public function down(): void
    {
        Schema::table('stok_barangs', function (Blueprint $table) {
            // Logika untuk membatalkan (rollback) perubahan
            $table->dropColumn('kondisi');
        });
    }
};