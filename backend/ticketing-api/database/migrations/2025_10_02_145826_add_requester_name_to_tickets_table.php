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
            // Menambahkan kolom 'requester_name' setelah kolom 'workshop_id'
            // Dibuat nullable() agar tiket lama tidak error
            $table->string('requester_name')->nullable()->after('workshop_id');
        });
    }

    public function down(): void
    {
        Schema::table('tickets', function (Blueprint $table) {
            // Perintah untuk membatalkan (jika perlu)
            $table->dropColumn('requester_name');
        });
    }
};
