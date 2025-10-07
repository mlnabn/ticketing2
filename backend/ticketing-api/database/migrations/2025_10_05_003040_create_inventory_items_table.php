<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('inventory_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('master_barang_id')->constrained('master_barangs', 'id_m_barang')->onDelete('cascade');
            $table->string('kode_barang_unik')->unique();
            $table->string('status')->default('Tersedia'); // Tersedia, Dipinjam, Rusak, Dihapus
            $table->date('tanggal_masuk')->useCurrent();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('inventory_items');
    }
};