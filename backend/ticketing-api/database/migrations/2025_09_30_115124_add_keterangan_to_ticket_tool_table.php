<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('ticket_tool', function (Blueprint $table) {
            // Tambahkan kolom untuk menyimpan keterangan saat barang hilang
            $table->text('keterangan')->nullable()->after('status');
        });
    }

    public function down(): void
    {
        Schema::table('ticket_tool', function (Blueprint $table) {
            $table->dropColumn('keterangan');
        });
    }
};