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
        Schema::table('master_barangs', function (Blueprint $table) {
            $table->dropColumn('harga_barang');
        });
    }

    public function down(): void
    {
        Schema::table('master_barangs', function (Blueprint $table) {
            $table->decimal('harga_barang', 15, 2)->default(0)->after('model_barang');
        });
    }
};
