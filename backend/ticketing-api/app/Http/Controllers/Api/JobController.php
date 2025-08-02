<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Job; // <-- KESALAHAN UTAMA ADA DI SINI, TAMBAHKAN BARIS INI
use Illuminate\Http\Request;

class JobController extends Controller
{
    /**
     * Menampilkan semua data pekerjaan.
     */
    public function index()
    {
        // Ambil semua job, termasuk data relasi worker-nya dan urutkan dari yang terbaru
        return Job::with('worker')->latest()->get();
    }

    /**
     * Menyimpan pekerjaan baru.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'worker_id' => 'required|exists:workers,id',
            'status' => 'required|string',
        ]);

        $job = Job::create($validated);

        return response()->json($job, 201); // 201 artinya 'Created'
    }

    /**
     * Menampilkan satu pekerjaan spesifik.
     * Kita menggunakan Route-Model Binding (Job $job) agar lebih ringkas.
     */
    public function show(Job $job)
    {
        // Muat relasi worker sebelum mengirim response
        return $job->load('worker');
    }

    /**
     * Memperbarui pekerjaan yang sudah ada.
     */
    public function update(Request $request, Job $job)
    {
        $validated = $request->validate([
            'title' => 'sometimes|required|string|max:255',
            'worker_id' => 'sometimes|required|exists:workers,id',
            'status' => 'sometimes|required|string',
        ]);

        $job->update($validated);

        return response()->json($job);
    }

    /**
     * Menghapus pekerjaan.
     */
    public function destroy(Job $job)
    {
        $job->delete();

        // Mengembalikan response kosong dengan status 204 (No Content)
        return response()->json(null, 204);
    }

    /**
     * Fungsi khusus untuk memperbarui status pekerjaan.
     */
    public function updateStatus(Request $request, Job $job) {
        $validated = $request->validate(['status' => 'required|string']);

        $job->update($validated);
        
        return response()->json($job);
    }
}