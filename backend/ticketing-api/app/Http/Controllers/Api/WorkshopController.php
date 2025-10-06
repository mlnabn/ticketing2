<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Workshop;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class WorkshopController extends Controller
{
    public function index()
    {
        return Workshop::orderBy('name')->get();
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:workshops,name',
        ]);

        $validated['code'] = $this->generateWorkshopCode($validated['name']);

        $workshop = Workshop::create($validated);
        return response()->json($workshop, 201);
    }

    public function show(Workshop $workshop)
    {
        return $workshop;
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
        ]);

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

    /**
     * BARU: Fungsi privat untuk menghasilkan kode workshop berdasarkan nama.
     * @param string $name
     * @return string
     */
    private function generateWorkshopCode(string $name): string
    {
        // 1. Bersihkan nama dari angka dan spasi berlebih
        $cleanedName = preg_replace('/[0-9]+/', '', $name);        
        $cleanedName = trim(preg_replace('/\s+/', ' ', $cleanedName)); 

        // 2. Pecah nama menjadi array kata
        $words = explode(' ', $cleanedName);

        // Kasus 2 & 3: Jika ada 2 kata atau lebih
        if (count($words) >= 2) {
            $firstLetter = Str::upper(substr($words[0], 0, 1));
            $secondLetter = Str::upper(substr($words[1], 0, 1));
            return $firstLetter . $secondLetter;
        }

        // Kasus 1: Jika hanya ada 1 kata
        elseif (count($words) === 1 && !empty($words[0])) {
            $word = $words[0];
            // Pastikan kata memiliki setidaknya 3 huruf
            if (strlen($word) >= 3) {
                $firstLetter = Str::upper(substr($word, 0, 1));
                $thirdLetter = Str::upper(substr($word, 2, 1));
                return $firstLetter . $thirdLetter;
            } else {
                // Fallback jika kata terlalu pendek (misal: "IT")
                return Str::upper(str_pad(substr($word, 0, 2), 2, 'X'));
            }
        }

        // Fallback default jika nama kosong atau tidak valid
        return 'XX';
    }
}