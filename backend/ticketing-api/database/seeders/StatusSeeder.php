<?php
namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class StatusSeeder extends Seeder {
    public function run(): void {
        DB::table('status_barang')->insert([
            ['nama_status' => 'Tersedia', 'warna_badge' => 'green'],
            ['nama_status' => 'Digunakan', 'warna_badge' => 'blue'],
            ['nama_status' => 'Perbaikan', 'warna_badge' => 'orange'],
            ['nama_status' => 'Rusak', 'warna_badge' => 'red'],
            ['nama_status' => 'Hilang', 'warna_badge' => 'black'],
        ]);
    }
}