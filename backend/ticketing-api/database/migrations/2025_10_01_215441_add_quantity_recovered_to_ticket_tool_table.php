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
        Schema::table('ticket_tool', function (Blueprint $table) {
            // Tambahkan kolom ini setelah quantity_lost untuk kerapian
            $table->integer('quantity_recovered')->unsigned()->default(0)->after('quantity_lost');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('ticket_tool', function (Blueprint $table) {
            $table->dropColumn('quantity_recovered');
        });
    }
};
