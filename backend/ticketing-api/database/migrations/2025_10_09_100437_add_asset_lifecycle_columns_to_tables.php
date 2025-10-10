<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration {
    public function up(): void
    {
        // 1. Tambahkan status baru "Dipinjam" ke tabel status
        DB::table('status_barang')->insert([
            ['nama_status' => 'Dipinjam', 'warna_badge' => 'purple']
        ]);

        // 2. Tambahkan semua kolom baru untuk pelacakan ke tabel stok_barangs
        Schema::table('stok_barangs', function (Blueprint $table) {
            // Kolom umum
            $table->text('deskripsi')->nullable()->after('kondisi');

            // Kolom untuk status 'Perbaikan'
            $table->foreignId('teknisi_perbaikan_id')->nullable()->after('workshop_id')->constrained('users')->onDelete('set null');
            $table->date('tanggal_mulai_perbaikan')->nullable()->after('teknisi_perbaikan_id');
            $table->date('tanggal_selesai_perbaikan')->nullable()->after('tanggal_mulai_perbaikan');

            // Kolom untuk status 'Rusak'
            $table->foreignId('user_perusak_id')->nullable()->after('tanggal_selesai_perbaikan')->constrained('users')->onDelete('set null');
            $table->date('tanggal_rusak')->nullable()->after('user_perusak_id');

            // Kolom untuk status 'Hilang'
            $table->foreignId('user_penghilang_id')->nullable()->after('tanggal_rusak')->constrained('users')->onDelete('set null');
            $table->date('tanggal_hilang')->nullable()->after('user_penghilang_id');
            $table->date('tanggal_ketemu')->nullable()->after('tanggal_hilang');
        });
    }

    public function down(): void
    {
        // Logika untuk membatalkan (rollback)
        Schema::table('stok_barangs', function (Blueprint $table) {
            $table->dropForeign(['teknisi_perbaikan_id']);
            $table->dropForeign(['user_perusak_id']);
            $table->dropForeign(['user_penghilang_id']);
            
            $table->dropColumn([
                'deskripsi',
                'teknisi_perbaikan_id',
                'tanggal_mulai_perbaikan',
                'tanggal_selesai_perbaikan',
                'user_perusak_id',
                'tanggal_rusak',
                'user_penghilang_id',
                'tanggal_hilang',
                'tanggal_ketemu',
            ]);
        });
        
        // Hapus status "Dipinjam"
        DB::table('status_barang')->where('nama_status', 'Dipinjam')->delete();
    }
};