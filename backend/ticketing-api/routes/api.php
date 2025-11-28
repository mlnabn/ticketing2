<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\Api\TicketController;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\NotificationController;
use App\Http\Controllers\AnalyticsController;
use App\Http\Controllers\LocationController;
use App\Http\Controllers\Api\OtpController;
use App\Http\Controllers\Auth\ForgotPasswordController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\Api\WorkshopController;
use App\Http\Controllers\Api\StokBarangController;
use App\Http\Controllers\Api\NotificationTemplateController;
use App\Http\Controllers\Api\MasterKategoriController;
use App\Http\Controllers\Api\SubKategoriController;
use App\Http\Controllers\Api\MasterBarangController;
use App\Http\Controllers\Api\StatusController;
use App\Http\Controllers\Api\ColorController;
use App\Http\Controllers\Api\InventoryReportController;
use App\Http\Controllers\Api\PurchaseProposalController;

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
Route::post('/auth/password/request-otp', [ForgotPasswordController::class, 'requestPasswordOtp']);
Route::post('/auth/password/reset-with-otp', [ForgotPasswordController::class, 'resetPasswordWithOtp']);

Route::post('/auth/refresh', [AuthController::class, 'refresh'])->middleware('jwt');

Route::post('/tickets/whatsapp', [TicketController::class, 'storeFromWhatsapp'])->middleware('apikey.auth');

// Route Terproteksi (Memerlukan Token JWT)
Route::middleware('jwt')->group(function () {

    Route::get('/dashboard-data', [DashboardController::class, 'getBootstrapData']);

    // --- Rute Autentikasi Pengguna ---
    Route::get('/user', [AuthController::class, 'getUser']);
    Route::put('/user', [AuthController::class, 'updateUser']);
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/admins', [UserController::class, 'getAdmins']);
    Route::get('/users/all', [UserController::class, 'all']);
    Route::post('/users/bulk-delete', [UserController::class, 'bulkDelete']);
    Route::post('/users/{user}', [UserController::class, 'update']);
    Route::get('/users/{user}/stats', [UserController::class, 'activityStats']);
    Route::apiResource('users', UserController::class)->except(['create', 'edit', 'update']);
    Route::get('/admins-for-report', [UserController::class, 'getAdminsForReport']);

    // // --- Rute untuk Tiket ---
    // Route::apiResource('urgency-keywords', UrgencyKeywordController::class)->only(['index', 'store', 'destroy']);
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
    Route::get('/tickets/export', [TicketController::class, 'export']);

    // --- Rute untuk Notifikasi ---
    Route::get('/notifications', [NotificationController::class, 'index']);
    Route::apiResource('notification-templates', NotificationTemplateController::class);
    Route::get('/notifications/global', [NotificationController::class, 'getGlobalNotifications']);
    Route::post('/notifications', [NotificationController::class, 'store']);
    Route::post('/notifications/mark-all-read', [NotificationController::class, 'markAllAsRead']);
    Route::delete('/notifications/{notification}', [NotificationController::class, 'destroy']);

    // Tambahkan rute untuk Analytics di dalam group ini
    Route::get('/tickets/analytics', [AnalyticsController::class, 'getTicketAnalytics']);
    Route::get('/tickets/admin-performance', [AnalyticsController::class, 'getAdminPerformance']);
    Route::get('/tickets/download-export', [TicketController::class, 'downloadExport']);

    Route::get('/locations', [LocationController::class, 'index']);

    // --- Rute untuk Proses Tiket ---
    Route::get('/tickets/{ticket}/borrowed-items', [TicketController::class, 'getBorrowedItems']);
    Route::post('/tickets/{ticket}/process-return', [TicketController::class, 'processReturn']);

    // --- Rute untuk Manajemen Inventaris ---
    Route::apiResource('purchase-proposals', PurchaseProposalController::class);
    Route::get('/purchase-proposals/{purchaseProposal}/export', [PurchaseProposalController::class, 'export']);
    Route::get('/inventory/items/{masterBarang}/stock-breakdown', [MasterBarangController::class, 'getStockBreakdown']);
    Route::get('/inventory/items/{masterBarang}/stock-by-color', [MasterBarangController::class, 'getStockByColor']);
    Route::get('/inventory/stock-items/search-available', [StokBarangController::class, 'searchAvailable']);
    Route::post('/inventory/stock-items', [StokBarangController::class, 'store']);
    Route::get('/inventory/stock-items', [StokBarangController::class, 'index']);
    Route::get('/inventory/stock-items/{stokBarang}', [StokBarangController::class, 'show']);
    Route::get('/inventory/stock-items/by-serial/{serial}', [StokBarangController::class, 'showBySerial']);
    Route::put('/inventory/stock-items/{stokBarang}', [StokBarangController::class, 'update']);
    Route::post('/inventory/stock-items/{stokBarang}/update-status', [StokBarangController::class, 'updateStatus']);
    Route::get('/inventory/stock-summary', [StokBarangController::class, 'getStockSummary']);

    Route::apiResource('inventory/categories', MasterKategoriController::class);
    Route::apiResource('inventory/sub-categories', SubKategoriController::class);
    Route::apiResource('inventory/items', MasterBarangController::class)->parameters(['items' => 'masterBarang']);
    Route::get('/inventory/items/variations/{kode_barang}', [MasterBarangController::class, 'getVariations']);
    Route::get('/inventory/items-flat', [MasterBarangController::class, 'indexFlat']);
    Route::post('/inventory/items/bulk-delete', [MasterBarangController::class, 'bulkDelete']);
    Route::post('/inventory/items/check-exists', [MasterBarangController::class, 'checkIfExists']);
    Route::post('/inventory/items/{masterBarang}/archive', [MasterBarangController::class, 'archive']);
    Route::post('/inventory/items/{masterBarang}/restore', [MasterBarangController::class, 'restore']);
    Route::post('/inventory/items/bulk-restore', [MasterBarangController::class, 'bulkRestore']);
    Route::post('/inventory/items/{masterBarang}', [MasterBarangController::class, 'update']);
    Route::get('/inventory/items/search/{query}', [MasterBarangController::class, 'searchByName']);
    Route::get('/inventory/items/code/{kode_barang}', [MasterBarangController::class, 'showByCode']);
    Route::get('/inventory/items/category/{categoryId}', [MasterBarangController::class, 'filterByCategory']);
    Route::get('/inventory/items/sub-category/{subCategoryId}', [MasterBarangController::class, 'filterBySubCategory']);
    Route::get('/inventory/stock-items/find-available/{code}', [StokBarangController::class, 'findAvailableByCode']);
    Route::get('/inventory/stock-items/{stokBarang}/history', [StokBarangController::class, 'getHistory']);
    Route::post('/inventory/check-sn-availability', [StokBarangController::class, 'checkSnAvailability']);

    Route::get('/statuses', [StatusController::class, 'index']);

    Route::apiResource('colors', ColorController::class);
    Route::get('/colors', [ColorController::class, 'index']);

    // --- Rute untuk Laporan Keuangan Inventaris ---
    Route::get('/financial-report/inventory', [App\Http\Controllers\Api\FinancialReportController::class, 'getInventoryReport']);
    Route::get('/financial-report/inventory/details', [App\Http\Controllers\Api\FinancialReportController::class, 'getDetailedTransactions']);
    Route::get('/financial-report/export', [App\Http\Controllers\Api\FinancialReportController::class, 'exportReport']);
    Route::get('/financial-report/chart-data', [App\Http\Controllers\Api\FinancialReportController::class, 'getFinancialChartData']);
    Route::get('/financial-report/asset-composition', [App\Http\Controllers\Api\FinancialReportController::class, 'getAssetComposition']);
    Route::get('/financial-report/value-by-category', [App\Http\Controllers\Api\FinancialReportController::class, 'getValueByCategory']);
    Route::get('/financial-report/top-purchases', [App\Http\Controllers\Api\FinancialReportController::class, 'getTopPurchasesByValue']);
    Route::prefix('reports/inventory')->name('reports.inventory.')->group(function () {
        Route::get('/stats', [InventoryReportController::class, 'getStats'])->name('stats');
        Route::get('/monthly-movement', [InventoryReportController::class, 'getMonthlyMovement'])->name('movement');
        Route::get('/detailed', [InventoryReportController::class, 'getDetailedReport'])->name('detailed');
        Route::get('/dashboard', [InventoryReportController::class, 'getDashboardData'])->name('dashboard');
        Route::get('/export', [InventoryReportController::class, 'exportReport'])->name('export');
    });
});
