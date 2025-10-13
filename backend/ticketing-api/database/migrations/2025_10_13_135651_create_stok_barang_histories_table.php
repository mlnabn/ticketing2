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
        Schema::create('stok_barang_histories', function (Blueprint $table) {
            $table->id();
            $table->foreignId('stok_barang_id')->constrained('stok_barangs')->onDelete('cascade');
            $table->foreignId('status_id')->constrained('status_barang')->onDelete('restrict');
            $table->text('deskripsi')->nullable();

            // Siapa yang melakukan aksi ini (Admin yang login)
            $table->foreignId('triggered_by_user_id')->nullable()->constrained('users')->onDelete('set null');

            // Siapa user yang terkait dengan status (Peminjam, Teknisi, dll.)
            $table->foreignId('related_user_id')->nullable()->constrained('users')->onDelete('set null');

            $table->foreignId('workshop_id')->nullable()->constrained('workshops')->onDelete('set null');

            $table->timestamps(); // Kapan kejadian ini dicatat (created_at)
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('stok_barang_histories');
    }
};
