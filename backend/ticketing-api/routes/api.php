<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\JobController;
use App\Http\Controllers\Api\WorkerController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| is assigned the "api" middleware group. Enjoy building your API!
|
*/

Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});

// Route untuk mendapatkan semua data pekerja dan pekerjaan
Route::apiResource('workers', WorkerController::class);
Route::apiResource('jobs', JobController::class);

// Route khusus untuk memperbarui status sebuah pekerjaan
// Ini adalah baris yang diperbaiki:
Route::patch('jobs/{job}/status', [JobController::class, 'updateStatus']);