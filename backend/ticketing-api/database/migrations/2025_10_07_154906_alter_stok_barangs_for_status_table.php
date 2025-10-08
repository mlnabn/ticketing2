<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration {
    public function up(): void {
        Schema::table('stok_barangs', function (Blueprint $table) {
            // 1. Tambah kolom status_id sebagai foreign key baru
            $table->foreignId('status_id')->nullable()->after('status')->constrained('status_barang');
        });
        
        // 2. Pindahkan data dari kolom string 'status' ke 'status_id'
        $statuses = DB::table('status_barang')->pluck('id', 'nama_status');
        $stokItems = DB::table('stok_barangs')->whereNotNull('status')->get();

        foreach ($stokItems as $item) {
            if (isset($statuses[$item->status])) {
                DB::table('stok_barangs')->where('id', $item->id)->update(['status_id' => $statuses[$item->status]]);
            }
        }

        Schema::table('stok_barangs', function (Blueprint $table) {
            // 3. Hapus kolom 'status' yang lama
            $table->dropColumn('status');
        });
    }

    public function down(): void {
        Schema::table('stok_barangs', function (Blueprint $table) {
            $table->string('status')->nullable()->after('status_id');
        });

        // Logika rollback (opsional, tapi baik untuk ada)
        $statuses = DB::table('status_barang')->pluck('nama_status', 'id');
        $stokItems = DB::table('stok_barangs')->whereNotNull('status_id')->get();
        foreach ($stokItems as $item) {
             if (isset($statuses[$item->status_id])) {
                DB::table('stok_barangs')->where('id', $item->id)->update(['status' => $statuses[$item->status_id]]);
            }
        }

        Schema::table('stok_barangs', function (Blueprint $table) {
            $table->dropForeign(['status_id']);
            $table->dropColumn('status_id');
        });
    }
};