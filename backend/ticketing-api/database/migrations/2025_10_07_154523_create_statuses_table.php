<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        // DIUBAH: Sesuai permintaan Anda, nama tabelnya adalah 'status_barang'
        Schema::create('status_barang', function (Blueprint $table) {
            $table->id();
            $table->string('nama_status')->unique();
            $table->string('warna_badge')->nullable(); // Opsional: untuk warna di frontend
            $table->timestamps();
        });
    }
    public function down(): void {
        Schema::dropIfExists('status_barang');
    }
};