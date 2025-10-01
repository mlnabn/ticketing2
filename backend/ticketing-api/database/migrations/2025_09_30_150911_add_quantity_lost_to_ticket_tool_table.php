<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('ticket_tool', function (Blueprint $table) {
            // Tambahkan kolom untuk menyimpan jumlah barang yang hilang
            $table->integer('quantity_lost')->default(0)->after('quantity_used');
        });
    }

    public function down(): void
    {
        Schema::table('ticket_tool', function (Blueprint $table) {
            $table->dropColumn('quantity_lost');
        });
    }
};
