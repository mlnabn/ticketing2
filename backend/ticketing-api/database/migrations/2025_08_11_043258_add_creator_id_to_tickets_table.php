<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('tickets', function (Blueprint $table) {
            // Tambahkan kolom baru untuk menyimpan ID si pembuat tiket
            $table->unsignedBigInteger('creator_id')->nullable()->after('user_id');

            // Tambahkan foreign key yang merujuk ke tabel users
            $table->foreign('creator_id')->references('id')->on('users')->onDelete('set null');
        });
    }

    public function down(): void
    {
        Schema::table('tickets', function (Blueprint $table) {
            // Hapus foreign key dan kolom jika migrasi di-rollback
            $table->dropForeign(['creator_id']);
            $table->dropColumn('creator_id');
        });
    }
};