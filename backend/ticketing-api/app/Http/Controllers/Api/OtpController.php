<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Controllers\AuthController;
use Illuminate\Http\Request;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Support\Facades\Cache;
use Tymon\JWTAuth\Facades\JWTAuth;

class OtpController extends Controller
{
    protected $authController;

    public function __construct(AuthController $authController)
    {
        $this->authController = $authController;
    }

    /**
     * Memverifikasi OTP dan memberikan token JWT jika berhasil.
     */
    public function verifyOtp(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255',
            'password' => 'required|string|min:6',
            'phone' => 'required|string|min:10',
            'otp' => 'required|string|digits:6',
        ]);

        $phone = $validated['phone'];
        $phone = preg_replace('/[^0-9]/', '', $phone);
        if (substr($phone, 0, 2) === '08') {
            $phone = '62' . substr($phone, 1);
        }

        $cacheKey = 'registration_data_' . $phone;
        $registrationData = Cache::get($cacheKey);

        if (
            !$registrationData ||
            $registrationData['otp_code'] !== $validated['otp'] || 
            Carbon::now()->gt($registrationData['otp_expires_at']) 
        ) {
            return response()->json(['message' => 'Kode OTP tidak valid atau telah kedaluwarsa.'], 400);
        }

        $user = User::create([
            'name' => $registrationData['name'],
            'email' => $registrationData['email'],
            'password' => $registrationData['password'], 
            'phone' => $registrationData['phone'],
            'role' => 'user',
            'phone_verified_at' => Carbon::now(), 
        ]);

        Cache::forget($cacheKey);

        $token = JWTAuth::fromUser($user);
        return $this->authController->respondWithToken($token, $user);
    }
}