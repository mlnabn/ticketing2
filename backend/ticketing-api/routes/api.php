<?php
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\TicketController; // <-- Diubah
use App\Http\Controllers\Api\WorkerController;

Route::apiResource('workers', WorkerController::class)->only(['index', 'store']);
Route::apiResource('tickets', TicketController::class)->only(['index', 'store', 'destroy']); // <-- Diubah
Route::patch('tickets/{ticket}/status', [TicketController::class, 'updateStatus']); // <-- Diubah