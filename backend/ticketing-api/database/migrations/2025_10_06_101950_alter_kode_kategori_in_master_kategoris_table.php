<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::table('master_kategoris', function (Blueprint $table) {
            $table->string('kode_kategori', 2)->change();
        });
    }
    public function down(): void {
        Schema::table('master_kategoris', function (Blueprint $table) {
            $table->string('kode_kategori', 10)->change();
        });
    }
};