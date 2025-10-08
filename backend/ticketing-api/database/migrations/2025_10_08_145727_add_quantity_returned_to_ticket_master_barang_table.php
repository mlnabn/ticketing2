<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('ticket_master_barang', function (Blueprint $table) {
            // Tambahkan kolom quantity_returned setelah quantity_used
            $table->integer('quantity_returned')->default(0)->after('quantity_used');
        });
    }

    public function down(): void
    {
        Schema::table('ticket_master_barang', function (Blueprint $table) {
            // Logika untuk membatalkan (rollback) perubahan
            $table->dropColumn('quantity_returned');
        });
    }
};