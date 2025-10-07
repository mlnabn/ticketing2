// add_tracking_columns_to_stok_barangs_table.php
<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::table('stok_barangs', function (Blueprint $table) {
            $table->string('serial_number')->nullable()->unique()->after('kode_unik');
            $table->date('tanggal_pembelian')->nullable()->after('status');
            $table->date('tanggal_keluar')->nullable()->after('tanggal_masuk');
        });
    }
    public function down(): void {
        Schema::table('stok_barangs', function (Blueprint $table) {
            $table->dropColumn(['serial_number', 'tanggal_pembelian', 'tanggal_keluar']);
        });
    }
};