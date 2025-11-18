<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('workshops', function (Blueprint $table) {
            $table->float('lat', 10, 6)->nullable()->after('code');
            $table->float('lng', 10, 6)->nullable()->after('lat');
            $table->string('description', 500)->nullable()->after('lng');
            $table->string('url')->nullable()->after('description'); // Hanya buat kolom!
        });
    }

    public function down(): void
    {
        Schema::table('workshops', function (Blueprint $table) {
            $table->dropColumn(['lat', 'lng', 'description', 'url']);
        });
    }
};
