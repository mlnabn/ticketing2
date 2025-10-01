<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\NotificationTemplate;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class NotificationTemplateController extends Controller
{
    /**
     * Menampilkan daftar semua template notifikasi.
     * Hanya bisa diakses oleh admin.
     */
    public function index()
    {
        if (Auth::user()->role !== 'admin') {
            return response()->json(['error' => 'Akses ditolak.'], 403);
        }
        return NotificationTemplate::orderBy('title')->get();
    }

    /**
     * Menyimpan template notifikasi baru ke database.
     * Hanya bisa diakses oleh admin.
     */
    public function store(Request $request)
    {
        if (Auth::user()->role !== 'admin') {
            return response()->json(['error' => 'Akses ditolak.'], 403);
        }

        $validated = $request->validate([
            'title' => 'required|string|max:255|unique:notification_templates',
            'message' => 'nullable|string',
        ]);

        $template = NotificationTemplate::create($validated);
        return response()->json($template, 201);
    }

    /**
     * Menampilkan satu template notifikasi spesifik.
     * Hanya bisa diakses oleh admin.
     */
    public function show(NotificationTemplate $notificationTemplate)
    {
        if (Auth::user()->role !== 'admin') {
            return response()->json(['error' => 'Akses ditolak.'], 403);
        }
        return $notificationTemplate;
    }

    /**
     * Memperbarui template notifikasi yang ada di database.
     * Hanya bisa diakses oleh admin.
     */
    public function update(Request $request, NotificationTemplate $notificationTemplate)
    {
        if (Auth::user()->role !== 'admin') {
            return response()->json(['error' => 'Akses ditolak.'], 403);
        }

        $validated = $request->validate([
            'title' => 'required|string|max:255|unique:notification_templates,title,' . $notificationTemplate->id,
            'message' => 'nullable|string',
        ]);

        $notificationTemplate->update($validated);
        return response()->json($notificationTemplate);
    }

    /**
     * Menghapus template notifikasi dari database.
     * Hanya bisa diakses oleh admin.
     */
    public function destroy(NotificationTemplate $notificationTemplate)
    {
        if (Auth::user()->role !== 'admin') {
            return response()->json(['error' => 'Akses ditolak.'], 403);
        }
        
        $notificationTemplate->delete();
        return response()->json(null, 204);
    }
}