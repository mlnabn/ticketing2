<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Tabel utama untuk menyimpan "Catatan Pengajuan"
        Schema::create('purchase_proposals', function (Blueprint $table) {
            $table->id();
            $table->string('title'); // Judul Catatan, mis: "Belanja Kebutuhan Q4 2025"
            $table->foreignId('created_by')->constrained('users')->onDelete('cascade');
            $table->decimal('total_estimated_cost', 15, 2)->default(0);
            $table->enum('status', ['draft', 'completed'])->default('draft');
            $table->timestamps();
        });

        // Tabel untuk menyimpan item-item di dalam setiap catatan
        Schema::create('purchase_proposal_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('purchase_proposal_id')->constrained('purchase_proposals')->onDelete('cascade');
            
            // Terhubung ke barang yang sudah ada (atau yang baru dibuat)
            $table->foreignId('master_barang_id')->constrained(
                table: 'master_barangs', column: 'id_m_barang'
            )->onDelete('cascade');
            
            $table->integer('quantity');
            $table->decimal('estimated_price', 15, 2); // Harga satuan
            $table->text('link')->nullable();
            $table->text('notes')->nullable(); // Keterangan
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('purchase_proposal_items');
        Schema::dropIfExists('purchase_proposals');
    }
};