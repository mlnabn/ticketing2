<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Controllers\AuthController;
use Illuminate\Http\Request;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Support\Facades\Cache;
use Tymon\JWTAuth\Facades\JWTAuth;
use Illuminate\Support\Facades\DB;

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

        $user = DB::transaction(function () use ($registrationData) {
            $existingUserByPhone = User::where('phone', $registrationData['phone'])->first();

            if ($existingUserByPhone) {
                
                if ($existingUserByPhone->phone_verified_at) {
                    throw new \Exception('Nomor telepon sudah terdaftar dan terverifikasi. Silakan login.');
                }

                $emailConflict = User::where('email', $registrationData['email'])
                                     ->where('id', '!=', $existingUserByPhone->id) 
                                     ->first();

                if ($emailConflict) {
                    if ($emailConflict->phone_verified_at) {
                        throw new \Exception('Email sudah digunakan oleh akun lain yang terverifikasi.');
                    } else {
                        $emailConflict->forceDelete();
                    }
                }

                $existingUserByPhone->update([
                    'name' => $registrationData['name'],
                    'email' => $registrationData['email'],
                    'password' => $registrationData['password'],
                    'phone_verified_at' => Carbon::now(),
                    'role' => 'user',
                ]);

                return $existingUserByPhone;

            } else {
                $existingUserByEmail = User::where('email', $registrationData['email'])->first();
                
                if ($existingUserByEmail) {
                    
                    if ($existingUserByEmail->phone_verified_at) {
                        throw new \Exception('Email sudah terdaftar. Silakan login.');
                    } 
                    
                    $existingUserByEmail->update([
                        'name' => $registrationData['name'], 
                        'password' => $registrationData['password'], 
                        'phone' => $registrationData['phone'], 
                        'phone_verified_at' => Carbon::now(),
                        'role' => 'user',
                    ]);
                    
                    return $existingUserByEmail; 
                }

                return User::create([
                    'name' => $registrationData['name'],
                    'email' => $registrationData['email'],
                    'password' => $registrationData['password'], 
                    'phone' => $registrationData['phone'],
                    'role' => 'user',
                    'phone_verified_at' => Carbon::now(), 
                ]);
            }
        });

        Cache::forget($cacheKey);

        $token = JWTAuth::fromUser($user);
        return $this->authController->respondWithToken($token, $user);
    }
}