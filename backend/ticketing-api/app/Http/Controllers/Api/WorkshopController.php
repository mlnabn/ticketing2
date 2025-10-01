<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Workshop;
use Illuminate\Http\Request;

class WorkshopController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        // Cukup kembalikan semua data workshop secara langsung sebagai array
        return Workshop::orderBy('name')->get();
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:workshops',
            'code' => 'required|string|max:2|unique:workshops',
        ]);

        $workshop = Workshop::create($validated);
        return response()->json($workshop, 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(Workshop $workshop)
    {
        return $workshop;
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Workshop $workshop)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:workshops,name,' . $workshop->id,
            'code' => 'required|string|max:2|unique:workshops,code,' . $workshop->id,
        ]);

        $workshop->update($validated);
        return response()->json($workshop);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Workshop $workshop)
    {
        // Tambahkan pengecekan jika workshop masih terpakai di tiket
        if ($workshop->tickets()->exists()) {
            return response()->json(['error' => 'Workshop tidak dapat dihapus karena masih digunakan oleh tiket.'], 409); // 409 Conflict
        }

        $workshop->delete();
        return response()->json(null, 204);
    }
}