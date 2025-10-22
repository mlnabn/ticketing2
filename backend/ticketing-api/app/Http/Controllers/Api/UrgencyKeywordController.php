<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\UrgencyKeyword;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;

class UrgencyKeywordController extends Controller
{
    private function clearCache() {
        Cache::forget('urgent_keywords_scores');
    }

    public function index()
    {
        return UrgencyKeyword::orderBy('score', 'desc')->get();
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'keyword' => 'required|string|unique:urgency_keywords,keyword',
            'score' => 'required|integer'
        ]);
        $keyword = UrgencyKeyword::create([
            'keyword' => strtolower($validated['keyword']),
            'score' => $validated['score']
        ]);
        
        $this->clearCache();
        return response()->json($keyword, 201);
    }

    public function destroy(UrgencyKeyword $urgencyKeyword)
    {
        $urgencyKeyword->delete();
        $this->clearCache();
        
        return response()->json(null, 204);
    }
}