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
            // 1. Tambahkan kolom 'created_by' terlebih dahulu
            $table->unsignedBigInteger('created_by')->nullable()->after('kondisi'); // Sesuaikan 'after' jika perlu

            // 2. Baru tambahkan kolom 'updated_by' setelahnya
            $table->unsignedBigInteger('updated_by')->nullable()->after('created_by');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('stok_barangs', function (Blueprint $table) {
            // Hapus kedua kolom jika di-rollback
            $table->dropColumn(['updated_by', 'created_by']);
        });
    }
};
