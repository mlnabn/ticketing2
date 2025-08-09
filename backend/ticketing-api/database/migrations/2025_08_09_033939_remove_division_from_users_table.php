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
        Schema::table('users', function (Blueprint $table) {
            // Perintah untuk menghapus kolom 'division'
            $table->dropColumn('division');
        });
    }

    public function down(): void
    {
        // Jika suatu saat ingin mengembalikan, kita bisa definisikan di sini
        Schema::table('users', function (Blueprint $table) {
            $table->string('division')->nullable();
        });
    }
};
