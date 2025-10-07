<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('master_barangs', function (Blueprint $table) {
            $table->dropColumn(['stok', 'kode_barang']);
        });
    }

    public function down(): void
    {
        Schema::table('master_barangs', function (Blueprint $table) {
            $table->integer('stok')->default(0);
            $table->string('kode_barang', 10)->unique()->nullable();
        });
    }
};