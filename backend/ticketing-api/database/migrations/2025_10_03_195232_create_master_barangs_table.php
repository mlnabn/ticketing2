<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('master_barangs', function (Blueprint $table) {
            $table->id('id_m_barang');
            $table->foreignId('id_kategori')->constrained('master_kategoris', 'id_kategori')->onDelete('restrict');
            $table->foreignId('id_sub_kategori')->constrained('sub_kategoris', 'id_sub_kategori')->onDelete('restrict');

            $table->string('kode_barang', 10)->unique();
            $table->string('nama_barang');
            $table->string('merk')->nullable();
            $table->string('model_barang')->nullable();
            $table->string('status_barang')->default('Tersedia'); // Cth: Tersedia, Dipinjam, Rusak
            $table->date('tanggal_pembelian')->nullable();
            $table->date('tanggal_masuk')->nullable();
            $table->string('digunakan_untuk')->nullable(); // Cth: Workshop A, Teknisi Lapangan
            $table->integer('stok')->default(0);
            $table->decimal('harga_barang', 15, 2)->nullable();
            $table->string('warna')->nullable();

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('master_barangs');
    }
};
