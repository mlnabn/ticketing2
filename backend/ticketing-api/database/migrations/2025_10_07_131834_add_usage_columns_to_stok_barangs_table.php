<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('stok_barangs', function (Blueprint $table) {
            $table->foreignId('user_peminjam_id')->nullable()->after('status')->constrained('users')->onDelete('set null');
            $table->foreignId('workshop_id')->nullable()->after('user_peminjam_id')->constrained('workshops')->onDelete('set null');
        });
    }

    public function down(): void
    {
        Schema::table('stok_barangs', function (Blueprint $table) {
            $table->dropForeign(['user_peminjam_id']);
            $table->dropForeign(['workshop_id']);
            $table->dropColumn(['user_peminjam_id', 'workshop_id']);
        });
    }
    };
