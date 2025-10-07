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
        Schema::table('master_barangs', function (Blueprint $table) {
            // Tambahkan kolom setelah 'harga_barang'
            $table->unsignedBigInteger('created_by')->nullable()->after('harga_barang');

            // Opsional: Tambahkan foreign key constraint jika Anda punya tabel 'users'
            // $table->foreign('created_by')->references('id')->on('users');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('master_barangs', function (Blueprint $table) {
            //
        });
    }
};
