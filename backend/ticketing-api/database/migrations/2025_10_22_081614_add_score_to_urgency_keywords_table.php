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
        Schema::table('urgency_keywords', function (Blueprint $table) {
            // Tambahkan kolom 'score'
            // Tipe integer agar bisa negatif (misal: "tidak" = -5)
            // Default 1, jadi kata kunci lama tetap berfungsi
            $table->integer('score')->default(1)->after('keyword');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('urgency_keywords', function (Blueprint $table) {
            $table->dropColumn('score');
        });
    }
};
