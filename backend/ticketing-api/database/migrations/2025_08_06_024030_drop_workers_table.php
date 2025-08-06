<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::dropIfExists('workers');
    }

    public function down(): void
    {
        // Kalau mau rollback, bisa buat ulang tabelnya. Tapi biasanya kosongkan saja.
        Schema::create('workers', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->timestamps();
        });
    }
};
