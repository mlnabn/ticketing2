<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Workshop;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\Http;

class WorkshopController extends Controller
{
    public function index(Request $request)
    {
        $perPage = $request->input('per_page', 15);

        $workshops = Workshop::orderBy('name')->paginate($perPage);

        return response()->json($workshops);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:workshops,name',
            'lat' => 'nullable|numeric',
            'lng' => 'nullable|numeric',
            'description' => 'nullable|string|max:500',
            'url' => 'nullable|url|max:2048',
        ]);

        // LOGIKA BARU UNTUK STORE
        if (!empty($validated['url'])) {
            $coordinates = $this->extractCoordinatesFromUrl($validated['url']);
            if ($coordinates) {
                $validated['lat'] = $coordinates['lat'];
                $validated['lng'] = $coordinates['lng'];
            }
        }
        // END LOGIKA BARU

        $validated['code'] = $this->generateWorkshopCode($validated['name']);

        $workshop = Workshop::create($validated);
        return response()->json($workshop, 201);
    }

    public function show(Workshop $workshop)
    {
        return $workshop;
    }

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

    public function update(Request $request, Workshop $workshop)
    {
        $validated = $request->validate([
            'name' => [
                'required',
                'string',
                'max:255',
                Rule::unique('workshops')->ignore($workshop->id),
            ],
            'lat' => 'nullable|numeric',
            'lng' => 'nullable|numeric',
            'description' => 'nullable|string|max:500',
            'url' => 'nullable|url|max:2048',
        ]);
        if (isset($validated['url']) && !empty($validated['url'])) {
            $coordinates = $this->extractCoordinatesFromUrl($validated['url']);

            if ($coordinates) {
                $validated['lat'] = $coordinates['lat'];
                $validated['lng'] = $coordinates['lng'];
            } else {
                $validated['lat'] = null;
                $validated['lng'] = null;
            }
        }

        $validated['code'] = $this->generateWorkshopCode($validated['name']);

        $workshop->update($validated);
        return response()->json($workshop);
    }


    public function destroy(Workshop $workshop)
    {

        if ($workshop->tickets()->exists()) {
            return response()->json(['error' => 'Workshop tidak dapat dihapus karena masih digunakan oleh tiket.'], 409);
        }

        $workshop->delete();
        return response()->json(null, 204);
    }

    private function generateWorkshopCode(string $name): string
    {

        $cleanedName = preg_replace('/[0-9]+/', '', $name);
        $cleanedName = trim(preg_replace('/\s+/', ' ', $cleanedName));
        $words = explode(' ', $cleanedName);
        $fullName = str_replace(' ', '', $cleanedName); 

        $baseCodes = [];

        // --- TAHAP 1: EKSTRAKSI KODE 2-HURUF PRIORITAS ---

        if (count($words) >= 2) {
            $w1 = $words[0];
            $w2 = $words[1];

            $baseCodes[] = Str::upper(substr($w1, 0, 1) . substr($w2, 0, 1));
            if (strlen($w2) >= 2) {
                $baseCodes[] = Str::upper(substr($w1, 0, 1) . substr($w2, -1, 1));
            }
            if (strlen($w1) >= 2) {
                $baseCodes[] = Str::upper(substr($w1, 1, 1) . substr($w2, 0, 1));
            }
        }
        if (strlen($fullName) >= 3) {
            $baseCodes[] = Str::upper(substr($fullName, 0, 1) . substr($fullName, 2, 1));
            if (strlen($fullName) >= 4) {
                $baseCodes[] = Str::upper(substr($fullName, 0, 1) . substr($fullName, 3, 1));
            }
            $baseCodes[] = Str::upper(substr($fullName, 0, 1) . substr($fullName, 1, 1));
            if (strlen($fullName) >= 5) {
                $baseCodes[] = Str::upper(substr($fullName, 0, 1) . substr($fullName, 4, 1));
            }
            $baseCodes[] = Str::upper(substr($fullName, 1, 1) . substr($fullName, 2, 1));
        }
        if (empty($baseCodes)) {
            $baseCodes[] = Str::upper(str_pad(substr($fullName, 0, 2), 2, 'X'));
        }
        $baseCodes = array_values(array_unique($baseCodes));

        // --- TAHAP 2: PENGUJIAN KODE DASAR DAN REKURSIF ---
        foreach ($baseCodes as $baseCode) {
            if (!$this->isCodeExists($baseCode)) {
                return $baseCode;
            }
        }

        // --- TAHAP 3: FALLBACK KE SUFIKS ANGKA ---
        $finalBaseCode = $baseCodes[0] ?? 'XX';

        return $this->generateUniqueCodeWithSuffix($finalBaseCode);
    }

    private function isCodeExists(string $code): bool
    {
        return Workshop::where('code', $code)->exists();
    }

    private function generateUniqueCodeWithSuffix(string $baseCode): string
    {
        $suffix = 1;
        $code = $baseCode . $suffix;
        while ($this->isCodeExists($code)) {
            $suffix++;
            $code = $baseCode . $suffix;
        }

        return $code;
    }
}
