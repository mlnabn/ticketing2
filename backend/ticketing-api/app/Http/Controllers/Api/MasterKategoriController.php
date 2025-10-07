<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\MasterKategori;
use Illuminate\Http\Request;

class MasterKategoriController extends Controller {
    public function index() {
        return MasterKategori::latest()->get();
    }

    public function store(Request $request) {
        $validated = $request->validate([
            'nama_kategori' => 'required|string|max:255|unique:master_kategoris,nama_kategori',
        ]);
        $validated['kode_kategori'] = $this->generateKategoriCode($validated['nama_kategori']);
        $kategori = MasterKategori::create($validated);
        return response()->json($kategori, 201);
    }
    
    private function generateKategoriCode(string $name): string {
        $words = explode(' ', $name);
        $cleanedName = preg_replace('/[^a-zA-Z]/', '', $name);

        if (count($words) >= 2) {
            return strtoupper($words[0][0] . $words[1][0]);
        }
        if (strlen($cleanedName) >= 3) {
            return strtoupper($cleanedName[0] . $cleanedName[2]);
        }
        if (strlen($cleanedName) >= 2) {
            return strtoupper(substr($cleanedName, 0, 2));
        }
        return strtoupper(str_pad(substr($cleanedName, 0, 2), 2, 'X'));
    }

    public function update(Request $request, MasterKategori $masterKategori) {
        $validated = $request->validate([
            'nama_kategori' => 'required|string|max:255|unique:master_kategoris,nama_kategori,' . $masterKategori->id_kategori . ',id_kategori',
        ]);
        $validated['kode_kategori'] = $this->generateKategoriCode($validated['nama_kategori']);
        $masterKategori->update($validated);
        return response()->json($masterKategori);
    }

    public function destroy(MasterKategori $masterKategori) {
        if ($masterKategori->subKategoris()->exists() || $masterKategori->masterBarangs()->exists()) {
            return response()->json(['message' => 'Kategori tidak dapat dihapus karena masih terkait.'], 422);
        }
        $masterKategori->delete();
        return response()->json(null, 204);
    }
};