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
        Schema::create('urgency_keywords', function (Blueprint $table) {
            $table->id();
            $table->string('keyword')->unique(); // Kata kunci harus unik
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('urgency_keywords');
    }
};
