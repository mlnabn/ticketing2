<?php

namespace App\Http\Controllers;

use App\Models\Workshop;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\DB;

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
        // Mendapatkan subquery untuk menghitung status tiket
        $ticketsCountQuery = DB::table('tickets')
            ->select(
                'workshop_id',
                DB::raw('COUNT(CASE WHEN status = "Selesai" THEN 1 END) as completed_count'),
                DB::raw('COUNT(CASE WHEN status != "Selesai" AND status != "Ditolak" THEN 1 END) as pending_count'), // Asumsi 'Belum dikerjakan' atau status lain yang aktif
                DB::raw('COUNT(*) as total_count')
            )
            ->groupBy('workshop_id');

        $workshops = Workshop::select(
            'workshops.id',
            'workshops.name as label',
            'workshops.lat',
            'workshops.lng',
            'workshops.latitude',
            'workshops.longitude',
            'workshops.description',
            'workshops.url',
            // Tambahkan kolom hitungan dari subquery
            DB::raw('COALESCE(tc.completed_count, 0) as completed_tickets'),
            DB::raw('COALESCE(tc.pending_count, 0) as pending_tickets'),
            DB::raw('COALESCE(tc.total_count, 0) as total_tickets')

        )
            ->leftJoin(DB::raw('(' . $ticketsCountQuery->toSql() . ') as tc'), 'workshops.id', '=', 'tc.workshop_id')
            ->mergeBindings($ticketsCountQuery) // Penting untuk binding parameter
            ->get();

        $locations = $workshops->map(function ($workshop) {
            // ... (Logika penentuan lat/lng dari lat, lng, latitude, longitude, atau url tetap sama)

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
                    // Tambahkan data tiket
                    'completed_tickets' => (int) $workshop->completed_tickets,
                    'pending_tickets' => (int) $workshop->pending_tickets,
                    'total_tickets' => (int) $workshop->total_tickets,
                ];
            }


            return null;
        })->filter()->values();

        return response()->json($locations);
    }
}
