<?php

namespace App\Http\Controllers;

use App\Models\Workshop;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;

class LocationController extends Controller
{

    private function extractCoordinatesFromUrl(string $url): ?array
    {
        
        if (Str::contains($url, ['maps.app.goo.gl', 'goo.gl/maps'])) {
            try {
                $response = Http::withoutRedirecting()->get($url);
                $longUrl = $response->header('Location');

                if ($longUrl) {
                    $url = $longUrl;
                }
            } catch (\Exception $e) {
            }
        }
        if (preg_match('/@(-?\\d+\\.\\d+),(-?\\d+\\.\\d+)/', $url, $matches)) {
            return [
                'lat' => (float) $matches[1],
                'lng' => (float) $matches[2]
            ];
        }
        if (preg_match('/place\\/.*@(-?\\d+\\.\\d+),(-?\\d+\\.\\d+)/', $url, $matches)) {
            return [
                'lat' => (float) $matches[1],
                'lng' => (float) $matches[2]
            ];
        }

        return null;
    }

    public function index()
    {
        $workshops = Workshop::select(
            'id',
            'name as label',
            'lat',
            'lng',
            'latitude',
            'longitude',
            'description',
            'url'
        )->get();

        $locations = $workshops->map(function ($workshop) {

            $lat = $workshop->lat;
            $lng = $workshop->lng;


            if (!$lat || !$lng) {

                $lat = $workshop->latitude ?? $lat;
                $lng = $workshop->longitude ?? $lng;
            }


            if (!$lat || !$lng) {
                if ($workshop->url) {
                    $coordinates = $this->extractCoordinatesFromUrl($workshop->url);
                    if ($coordinates) {
                        $lat = $coordinates['lat'];
                        $lng = $coordinates['lng'];
                    }
                }
            }


            if ($lat && $lng) {
                return [
                    'id' => $workshop->id,
                    'label' => $workshop->label,
                    'lat' => (float) $lat,
                    'lng' => (float) $lng,
                    'description' => $workshop->description,
                    'url' => $workshop->url,
                ];
            }


            return null;
        })->filter()->values();

        return response()->json($locations);
    }
}
