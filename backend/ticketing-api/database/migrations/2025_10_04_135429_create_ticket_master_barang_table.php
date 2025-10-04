// database/migrations/xxxx_xx_xx_xxxxxx_create_ticket_master_barang_table.php

<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('ticket_master_barang', function (Blueprint $table) {
            $table->id();
            $table->foreignId('ticket_id')->constrained('tickets')->onDelete('cascade');
            $table->foreignId('master_barang_id')->constrained('master_barangs', 'id_m_barang')->onDelete('restrict');

            $table->integer('quantity_used');
            $table->string('status')->default('dipinjam'); // dipinjam, dikembalikan, hilang, kembali sebagian, dipulihkan
            $table->text('keterangan')->nullable();
            $table->integer('quantity_lost')->default(0);
            $table->integer('quantity_recovered')->default(0);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('ticket_master_barang');
    }
};