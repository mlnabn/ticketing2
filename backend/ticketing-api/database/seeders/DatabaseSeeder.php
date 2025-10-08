<?php

namespace Database\Seeders;

use App\Models\User;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Menggunakan firstOrCreate agar aman dijalankan berulang kali
        User::firstOrCreate(
            [
                'email' => 'test@example.com' // Kunci untuk mencari
            ],
            [
                'name' => 'Test User', // Data yang akan dibuat jika tidak ada
                'password' => bcrypt('password') // Jangan lupa set password
            ]
        );

        // Panggil seeder lain di sini
        $this->call([
            ColorSeeder::class,
        ]);
    }
}
