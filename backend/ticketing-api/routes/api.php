<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Http\Request;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\Api\TicketController;
use App\Http\Controllers\Api\UserController;

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

    // --- Rute untuk Tiket ---
    Route::get('/tickets/stats', [TicketController::class, 'stats']);
    Route::get('/tickets/created-by-me', [TicketController::class, 'createdTickets']);
    Route::post('/tickets/bulk-delete', [TicketController::class, 'bulkDelete']);
    Route::patch('/tickets/{ticket}/status', [TicketController::class, 'updateStatus']);
    Route::apiResource('tickets', TicketController::class)->only(['index', 'store', 'destroy']);
    
    // --- Rute untuk Manajemen Pengguna oleh Admin ---
    // Route manual untuk update menggunakan POST agar sesuai dengan frontend
    Route::post('/users/{user}', [UserController::class, 'update']);

    // apiResource untuk sisa method (index, store, show, destroy).
    // 'update' dikecualikan untuk menghindari konflik dengan route POST di atas.
    Route::apiResource('users', UserController::class)->except(['create', 'edit', 'update']);
});