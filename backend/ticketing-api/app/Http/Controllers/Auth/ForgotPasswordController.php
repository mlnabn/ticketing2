<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Controllers\AuthController;
use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Carbon\Carbon;
use Tymon\JWTAuth\Facades\JWTAuth;

class ForgotPasswordController extends Controller
{
    protected $authController;

    /**
     * Inject AuthController untuk menggunakan helper respondWithToken
     */
    public function __construct(AuthController $authController)
    {
        $this->authController = $authController;
    }

    /**
     * Kirim OTP untuk reset password.
     */
    public function requestPasswordOtp(Request $request)
    {
        $validated = $request->validate(['phone' => 'required|string|min:10']);
        $phone = $validated['phone'];

        $phone = preg_replace('/[^0-9]/', '', $phone);
        if (substr($phone, 0, 2) === '08') {
            $phone = '62' . substr($phone, 1);
        }

        $user = User::where('phone', $phone)->first();
        if ($user) {
            $otpCode = (string) rand(100000, 999999);
            $otpExpiresAt = Carbon::now()->addMinutes(5);
            $cacheKey = 'password_reset_otp_' . $phone;
            Cache::put($cacheKey, $otpCode, $otpExpiresAt);
            $n8nWebhookUrl = 'http://127.0.0.1:5678/webhook/whatsapp-otp'; 
            
            try {
                Http::timeout(5)->post($n8nWebhookUrl, [
                    'phone' => $phone, 
                    'otp' => $otpCode
                ]);
                
                Log::info("OTP request sent to n8n for {$phone}");
                
            } catch (\Exception $e) {
                Log::error('Gagal kirim OTP reset password: ' . $e->getMessage());
            }
        } else {
            Log::warning("Reset password requested for unknown phone: {$phone}");
        }
        return response()->json([
            'message' => 'Jika nomor Anda terdaftar, kode verifikasi telah dikirim ke WhatsApp Anda.',
            'phone' => $phone 
        ], 200);
    }

    /**
     * Verifikasi OTP dan reset password.
     */
    public function resetPasswordWithOtp(Request $request)
    {
        $validated = $request->validate([
            'phone' => 'required|string|min:10',
            'otp' => 'required|string|digits:6',
            'password' => 'required|string|min:6|confirmed', 
        ]);

        $phone = $validated['phone'];
        $phone = preg_replace('/[^0-9]/', '', $phone);

        if (substr($phone, 0, 2) === '08') {
            $phone = '62' . substr($phone, 1);
        }

        $cacheKey = 'password_reset_otp_' . $phone;
        $cachedOtp = Cache::get($cacheKey);

        if (!$cachedOtp || $cachedOtp !== $validated['otp']) {
            return response()->json(['message' => 'Kode OTP tidak valid atau telah kedaluwarsa.'], 400);
        }

        $user = User::where('phone', $phone)->first();
        if (!$user) {
            return response()->json(['message' => 'User tidak ditemukan.'], 404);
        }

        $user->password = Hash::make($validated['password']);
        $user->save();
        
        Cache::forget($cacheKey);
        $token = JWTAuth::fromUser($user);
        return $this->authController->respondWithToken($token, $user);
    }
}