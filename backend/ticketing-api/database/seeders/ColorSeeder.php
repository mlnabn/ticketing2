<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Color;

class ColorSeeder extends Seeder
{
    public function run(): void
    {
        $colors = [
            ['nama_warna' => 'Hitam', 'kode_hex' => '#000000'],
            ['nama_warna' => 'Putih', 'kode_hex' => '#FFFFFF'],
            ['nama_warna' => 'Merah', 'kode_hex' => '#FF0000'],
            ['nama_warna' => 'Hijau', 'kode_hex' => '#008000'],
            ['nama_warna' => 'Biru', 'kode_hex' => '#0000FF'],
            ['nama_warna' => 'Kuning', 'kode_hex' => '#FFFF00'],
            ['nama_warna' => 'Abu-abu', 'kode_hex' => '#808080'],
            ['nama_warna' => 'Silver', 'kode_hex' => '#C0C0C0'],
        ];
        Color::insert($colors);
    }
}
