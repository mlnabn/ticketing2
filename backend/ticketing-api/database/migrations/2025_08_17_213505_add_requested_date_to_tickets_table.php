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
        // Tambahkan kolom ini untuk menyimpan tanggal yang di-request
        $table->date('requested_date')->nullable()->after('requested_time');
    });
}
    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('tickets', function (Blueprint $table) {
            //
        });
    }
};
