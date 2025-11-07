<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('master_barangs', function (Blueprint $table) {
            // Tambahkan kolom 'is_active' setelah 'created_by'
            $table->boolean('is_active')->default(true)->after('created_by');
        });
    }

    public function down(): void
    {
        Schema::table('master_barangs', function (Blueprint $table) {
            $table->dropColumn('is_active');
        });
    }
};