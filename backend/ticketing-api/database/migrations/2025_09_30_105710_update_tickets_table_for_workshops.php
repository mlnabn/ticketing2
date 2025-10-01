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
        // Tambahkan kolom baru untuk foreign key
        $table->unsignedBigInteger('workshop_id')->nullable()->after('workshop');
        // Tambahkan constraint
        $table->foreign('workshop_id')->references('id')->on('workshops')->onDelete('set null');
    });
}

public function down(): void
{
    Schema::table('tickets', function (Blueprint $table) {
        // Hapus constraint dan kolom jika rollback
        $table->dropForeign(['workshop_id']);
        $table->dropColumn('workshop_id');
    });
}
};
