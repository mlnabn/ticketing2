<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\UrgencyKeyword;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;

class UrgencyKeywordController extends Controller
{
    private function clearCache() {
        Cache::forget('urgent_keywords');
    }

    public function index()
    {
        return UrgencyKeyword::latest()->get();
    }

    public function store(Request $request)
    {
        $validated = $request->validate(['keyword' => 'required|string|unique:urgency_keywords,keyword']);
        $keyword = UrgencyKeyword::create(['keyword' => strtolower($validated['keyword'])]);
        
        $this->clearCache(); // Hapus cache agar data baru terbaca
        return response()->json($keyword, 201);
    }

    public function destroy(UrgencyKeyword $urgencyKeyword)
    {
        $urgencyKeyword->delete();
        $this->clearCache(); // Hapus cache
        
        return response()->json(null, 204);
    }
}