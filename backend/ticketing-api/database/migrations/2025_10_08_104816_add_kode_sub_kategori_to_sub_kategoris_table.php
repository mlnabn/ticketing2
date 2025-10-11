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
        Schema::table('sub_kategoris', function (Blueprint $table) {
            $table->string('kode_sub_kategori', 5)->nullable()->after('nama_sub');
        });
    }
    public function down(): void
    {
        Schema::table('sub_kategoris', function (Blueprint $table) {
            $table->dropColumn('kode_sub_kategori');
        });
    }
};
