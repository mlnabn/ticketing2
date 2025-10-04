<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('master_kategoris', function (Blueprint $table) {
            $table->id('id_kategori');
            $table->string('kode_kategori', 10)->unique();
            $table->string('nama_kategori')->unique();
            $table->timestamps(); // Ini akan membuat created_at (date_add) dan updated_at
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('master_kategoris');
    }
};
