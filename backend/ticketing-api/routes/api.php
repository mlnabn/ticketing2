<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Http\Request;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\Api\TicketController;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\NotificationController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

// Route Publik (Tanpa Autentikasi)
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

// Route Terproteksi (Memerlukan Token JWT)
Route::middleware('jwt')->group(function () {

    // --- Rute Autentikasi Pengguna ---
    Route::get('/user', [AuthController::class, 'getUser']);
    Route::put('/user', [AuthController::class, 'updateUser']); // Untuk user update profil sendiri
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/admins', [UserController::class, 'getAdmins']);

    // --- Rute untuk Tiket ---
    Route::get('/tickets/stats', [TicketController::class, 'stats']);
    Route::patch('/tickets/{ticket}/reject', [TicketController::class, 'reject']);
    Route::get('/tickets/created-by-me', [TicketController::class, 'createdTickets']);
    Route::post('/tickets/bulk-delete', [TicketController::class, 'bulkDelete']);
    Route::patch('/tickets/{ticket}/status', [TicketController::class, 'updateStatus']);
    Route::patch('/tickets/{ticket}/assign', [TicketController::class, 'assign']);
    Route::post('/tickets/{ticket}/submit-proof', [TicketController::class, 'submitProof']);
    Route::apiResource('tickets', TicketController::class)->only(['index', 'store', 'destroy']);
    
    Route::get('/users/all', [UserController::class, 'all']);

    // --- Rute untuk Manajemen Pengguna oleh Admin ---
    // Route manual untuk update menggunakan POST agar sesuai dengan frontend
    Route::post('/users/{user}', [UserController::class, 'update']);

    // apiResource untuk sisa method (index, store, show, destroy).
    // 'update' dikecualikan untuk menghindari konflik dengan route POST di atas.
    Route::apiResource('users', UserController::class)->except(['create', 'edit', 'update']);

    Route::get('/notifications', [NotificationController::class, 'index']); // Untuk user mengambil notif
    Route::post('/notifications', [NotificationController::class, 'store']); // Untuk admin mengirim notif
    Route::post('/notifications/mark-all-read', [NotificationController::class, 'markAllAsRead']); // Untuk user menandai sudah baca
});