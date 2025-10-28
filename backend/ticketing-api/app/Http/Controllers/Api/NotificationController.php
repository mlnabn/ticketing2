<?php
// app/Http/Controllers/Api/NotificationController.php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Notification;
use Illuminate\Support\Facades\Auth;

class NotificationController extends Controller
{
    // Fungsi untuk Admin: Membuat notifikasi baru
    public function store(Request $request)
    {
        // Middleware JWT sudah memastikan ada user, kita tinggal cek rolenya
        if (Auth::user()->role !== 'admin') {
            return response()->json(['error' => 'Hanya admin yang dapat melakukan aksi ini.'], 403);
        }

        $request->validate([
            'title' => 'required|string|max:255',
            'message' => 'required|string',
            'target_user_id' => 'nullable|exists:users,id'
        ]);

        Notification::create([
            'title' => $request->title,
            'message' => $request->message,
            'user_id' => $request->target_user_id,
        ]);

        return response()->json(['message' => 'Notifikasi berhasil dikirim'], 201);
    }

    // Fungsi untuk User: Mengambil notifikasi mereka
    public function index()
    {
        $userId = Auth::id();
        
        // Ambil notifikasi spesifik untuk user ini DAN notifikasi broadcast (user_id is null)
        $notifications = Notification::where('user_id', $userId)
                                    ->orWhereNull('user_id')
                                    ->orderBy('created_at', 'desc')
                                    ->limit(20) // Batasi jumlah notif untuk performa
                                    ->get();

        return response()->json($notifications);
    }

    // Fungsi untuk User: Menandai semua notifikasi sebagai sudah dibaca
    public function markAllAsRead()
    {
        return response()->json(['message' => 'Notifikasi ditandai sebagai dibaca']);
    }

    public function getGlobalNotifications(Request $request)
    {
        if (Auth::user()->role !== 'admin') {
            return response()->json(['error' => 'Aksi tidak diizinkan.'], 403);
        }
        $perPage = $request->input('per_page', 15);
        $globalNotifications = Notification::whereNull('user_id')
                                           ->orderBy('created_at', 'desc')
                                           ->paginate($perPage);
        
        return response()->json($globalNotifications);
    }

    public function destroy(Notification $notification)
    {
        $user = Auth::user();

        if ($user->role === 'admin' || $notification->user_id === $user->id) {
            $notification->delete();
            return response()->json(['message' => 'Notifikasi berhasil dihapus.']);
        }

        return response()->json(['error' => 'Aksi tidak diizinkan.'], 403);
    }
}