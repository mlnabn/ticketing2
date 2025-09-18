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
            [
                "id" => 3,
                "label" => "Workshop Dtech Engineering",
                "lat" => -7.3785594,
                "lng" => 110.5063332,
                "description" => "Lokasi Nobo",
                "url" => "https://maps.app.goo.gl/x2DWL7RQi1BLSZpP9"
            ],

            [
                "id" => 4,
                "label" => "Workshop Dtech x Muhasa Salatiga",
                "lat" => -7.3047184,
                "lng" => 110.4875557,
                "description" => "Lokasi Muhasa",
                "url" => "https://maps.app.goo.gl/9i5fv9n5dzzp11ME6"
            ],
            // Tambahkan lokasi lain di sini
        ];

        return response()->json($locations);
    }
}
