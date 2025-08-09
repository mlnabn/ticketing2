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
        Schema::table('tickets', function (Blueprint $table) {
            // Tambahkan baris ini
            $table->string('workshop')->after('title')->nullable(); 
        });
    }

    public function down(): void
    {
        Schema::table('tickets', function (Blueprint $table) {
            // Untuk rollback jika diperlukan
            $table->dropColumn('workshop');
        });
    }
};
