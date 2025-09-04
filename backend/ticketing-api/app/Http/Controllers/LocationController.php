<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class LocationController extends Controller
{
    /**
     * Ambil data lokasi untuk peta.
     */
    public function index()
    {
        // Data statis untuk contoh. Anda bisa mengambilnya dari database.
        $locations = [
            [
                "id" => 1,
                "label" => "Kantor Utama",
                "lat" => -7.3206,
                "lng" => 110.5114,
                "description" => "Lokasi kantor pusat di Canden.",
                "url" => "https://maps.app.goo.gl/iWf4Sm78a4fU4WWT7"
            ],
            [
                "id" => 2,
                "label" => "GUDANG ARUMI MOTOPARTS",
                "lat" => -7.3662976,
                "lng" => 110.4728536,
                "description" => "Lokasi Bener",
                "url" => "https://maps.app.goo.gl/JnK7GnZeC4B4rQFu7"
            ],
            // Tambahkan lokasi lain di sini
        ];

        return response()->json($locations);
    }
}
