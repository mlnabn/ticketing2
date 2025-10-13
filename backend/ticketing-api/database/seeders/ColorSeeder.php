<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Color;
use Illuminate\Support\Facades\Schema; // <-- TAMBAHKAN INI

class ColorSeeder extends Seeder
{
    /**
     * Menjalankan proses seeding database.
     *
     * @return void
     */
    public function run(): void
    {
        // TAMBAHKAN: Menonaktifkan pengecekan foreign key
        Schema::disableForeignKeyConstraints();

        // Kosongkan tabel. Sekarang ini tidak akan error.
        Color::truncate();

        // TAMBAHKAN: Mengaktifkan kembali pengecekan foreign key
        Schema::enableForeignKeyConstraints();

        $mappings = getColorMappings();
        $allColors = array_merge(
            $mappings['customColorMap'],
            $mappings['cssColorHexMap']
        );

        $colorsToSeed = [];
        $seenNames = [];

        foreach ($allColors as $name => $hex) {
            $formattedName = ucfirst(str_replace('-', ' ', $name));
            if (in_array(strtolower($formattedName), $seenNames)) {
                continue;
            }
            $colorsToSeed[] = [
                'nama_warna' => $formattedName,
                'kode_hex'   => strtolower($hex),
                'created_at' => now(),
                'updated_at' => now(),
            ];
            $seenNames[] = strtolower($formattedName);
        }

        Color::insert($colorsToSeed);
    }
}
