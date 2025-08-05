<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Http\Request;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\Api\TicketController;
use App\Http\Controllers\Api\WorkerController;

Route::get('/', function () {
    return response()->json(['message' => 'Hello world!']);
});

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

Route::middleware('jwt')->group(function () {

    // Auth
    Route::get('/user', [AuthController::class, 'getUser']);
    Route::put('/user', [AuthController::class, 'updateUser']);
    Route::post('/logout', [AuthController::class, 'logout']);

    // Workers
    Route::apiResource('workers', WorkerController::class)->only(['index', 'store']);

    // Tickets
    Route::apiResource('tickets', TicketController::class)->only(['index', 'store', 'destroy']);
    Route::patch('tickets/{ticket}/status', [TicketController::class, 'updateStatus']);
});
