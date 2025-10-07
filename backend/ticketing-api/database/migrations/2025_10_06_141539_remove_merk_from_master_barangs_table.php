<?php

// database/migrations/xxxx_xx_xx_xxxxxx_remove_merk_from_master_barangs_table.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('master_barangs', function (Blueprint $table) {
            // Perintah untuk menghapus kolom 'merk'
            $table->dropColumn('merk');
        });
    }

    public function down(): void
    {
        Schema::table('master_barangs', function (Blueprint $table) {
            // (Opsional) Perintah untuk mengembalikan kolom jika migration di-rollback
            $table->string('merk')->nullable()->after('status');
        });
    }
};
