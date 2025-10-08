<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\Api\TicketController;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\NotificationController;
use App\Http\Controllers\AnalyticsController;
use App\Http\Controllers\LocationController;
use App\Http\Controllers\Api\OtpController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\Api\WorkshopController;
use App\Http\Controllers\Api\StokBarangController;
use App\Http\Controllers\Api\NotificationTemplateController;
use App\Http\Controllers\Api\MasterKategoriController;
use App\Http\Controllers\Api\SubKategoriController;
use App\Http\Controllers\Api\MasterBarangController;
use App\Http\Controllers\Api\StatusController;
use App\Http\Controllers\Api\ColorController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

// Route Publik (Tanpa Autentikasi)
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
Route::get('/tickets/by-code/{kode_tiket}', [TicketController::class, 'showByCode']);
Route::post('/otp/send', [OtpController::class, 'sendOtp']);
Route::post('/otp/verify', [OtpController::class, 'verifyOtp']);
Route::post('/otp/resend', [AuthController::class, 'resendOtp']);
Route::get('/auth/google/redirect', [AuthController::class, 'redirectToGoogle']);
Route::get('/auth/google/callback', [AuthController::class, 'handleGoogleCallback']);

Route::post('/auth/refresh', [AuthController::class, 'refresh'])->middleware('jwt.refresh');

Route::post('/tickets/whatsapp', [TicketController::class, 'storeFromWhatsapp'])->middleware('apikey.auth');

// Route Terproteksi (Memerlukan Token JWT)
Route::middleware('jwt')->group(function () {

    Route::get('/dashboard-data', [DashboardController::class, 'getBootstrapData']);

    // --- Rute Autentikasi Pengguna ---
    Route::get('/user', [AuthController::class, 'getUser']);
    Route::put('/user', [AuthController::class, 'updateUser']);
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/admins', [UserController::class, 'getAdmins']);

    // --- Rute untuk Tiket ---
    Route::apiResource('workshops', WorkshopController::class);
    Route::get('/tickets/stats', [TicketController::class, 'stats']);
    Route::patch('/tickets/{ticket}/reject', [TicketController::class, 'reject']);
    Route::get('/tickets/created-by-me', [TicketController::class, 'createdTickets']);
    Route::post('/tickets/bulk-delete', [TicketController::class, 'bulkDelete']);
    Route::patch('/tickets/{ticket}/status', [TicketController::class, 'updateStatus']);
    Route::patch('/tickets/{ticket}/assign', [TicketController::class, 'assign']);
    Route::post('/tickets/{ticket}/submit-proof', [TicketController::class, 'submitProof']);
    Route::apiResource('tickets', TicketController::class)->only(['index', 'store', 'destroy']);
    Route::get('/tickets/my-tickets', [TicketController::class, 'myTickets']);
    Route::get('/tickets/all', [TicketController::class, 'allTickets']);
    Route::get('/tickets/admin-report/{adminId}', [TicketController::class, 'getAdminReport']);
    Route::get('/tickets/report-analytics', [TicketController::class, 'getReportAnalytics']);
    Route::get('/tickets/report-stats', [TicketController::class, 'reportStats']);
    Route::get('/users/all', [UserController::class, 'all']);
    Route::get('/tickets/export', [TicketController::class, 'export']);

    // --- Rute untuk Manajemen Pengguna oleh Admin ---
    // Route manual untuk update menggunakan POST agar sesuai dengan frontend
    Route::post('/users/{user}', [UserController::class, 'update']);

    // apiResource untuk sisa method (index, store, show, destroy).
    // 'update' dikecualikan untuk menghindari konflik dengan route POST di atas.
    Route::apiResource('users', UserController::class)->except(['create', 'edit', 'update']);

    Route::get('/notifications', [NotificationController::class, 'index']); // Untuk user mengambil notif
    Route::apiResource('notification-templates', NotificationTemplateController::class);
    Route::get('/notifications/global', [NotificationController::class, 'getGlobalNotifications']);
    Route::post('/notifications', [NotificationController::class, 'store']); // Untuk admin mengirim notif
    Route::post('/notifications/mark-all-read', [NotificationController::class, 'markAllAsRead']); // Untuk user menandai sudah baca
    Route::delete('/notifications/{notification}', [NotificationController::class, 'destroy']);

    // Tambahkan rute untuk Analytics di dalam group ini
    Route::get('/tickets/analytics', [AnalyticsController::class, 'getTicketAnalytics']);
    Route::get('/tickets/admin-performance', [AnalyticsController::class, 'getAdminPerformance']);
    Route::get('/tickets/download-export', [TicketController::class, 'downloadExport']);

    Route::get('/locations', [LocationController::class, 'index']);

    // --- Rute untuk Proses Tiket ---
    Route::post('/tickets/{ticket}/process-return', [TicketController::class, 'processReturn']);

    Route::post('/inventory/stock-items', [StokBarangController::class, 'store']);
    Route::get('/inventory/stock-items', [StokBarangController::class, 'index']);
    Route::get('/inventory/stock-items/{stokBarang}', [StokBarangController::class, 'show']);
    Route::get('/inventory/stock-items/by-serial/{serial}', [StokBarangController::class, 'showBySerial']);
    Route::post('/inventory/stock-items/{stokBarang}', [StokBarangController::class, 'update']);
    Route::post('/inventory/stock-items/{stokBarang}/checkout', [StokBarangController::class, 'checkout']);

    // --- Rute untuk Manajemen Inventaris ---
    Route::apiResource('inventory/categories', MasterKategoriController::class);
    Route::apiResource('inventory/sub-categories', SubKategoriController::class);

    Route::apiResource('inventory/items', MasterBarangController::class)->parameters(['items' => 'masterBarang']);
    Route::post('/inventory/items/check-exists', [MasterBarangController::class, 'checkIfExists']);
    Route::post('/inventory/items/{masterBarang}', [MasterBarangController::class, 'update']);
    Route::get('/inventory/items/search/{query}', [MasterBarangController::class, 'searchByName']);
    Route::get('/inventory/items/code/{kode_barang}', [MasterBarangController::class, 'showByCode']);
    Route::get('/inventory/items/category/{categoryId}', [MasterBarangController::class, 'filterByCategory']);
    Route::get('/inventory/items/sub-category/{subCategoryId}', [MasterBarangController::class, 'filterBySubCategory']);

    Route::get('/statuses', [StatusController::class, 'index']);

    Route::apiResource('colors', ColorController::class);

});
