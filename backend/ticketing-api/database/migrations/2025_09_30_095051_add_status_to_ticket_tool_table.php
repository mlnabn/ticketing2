<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up()
    {
        Schema::table('ticket_tool', function (Blueprint $table) {
            // Tambahkan kolom status setelah 'quantity_used'
            $table->string('status')->default('dipinjam')->after('quantity_used');
        });
    }

    public function down()
    {
        Schema::table('ticket_tool', function (Blueprint $table) {
            $table->dropColumn('status');
        });
    }
};
