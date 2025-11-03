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
        $user = User::where('phone', $validated['phone'])
                    ->whereNotNull('phone_verified_at')
                    ->first();

        if ($user) {
            $otpCode = (string) rand(100000, 999999);
            $otpExpiresAt = Carbon::now()->addMinutes(5);
            $cacheKey = 'password_reset_otp_' . $validated['phone'];
            Cache::put($cacheKey, $otpCode, $otpExpiresAt);

            $n8nWebhookUrl = 'http://localhost:5678/webhook/whatsapp-otp'; 
            try {
                Http::get($n8nWebhookUrl, ['phone' => $validated['phone'], 'otp' => $otpCode]);
            } catch (\Exception $e) {
                Log::error('Gagal kirim OTP reset password: ' . $e->getMessage());
            }
        }

        return response()->json([
            'message' => 'Jika nomor Anda terdaftar, kode verifikasi telah dikirim ke WhatsApp Anda.',
            'phone' => $validated['phone']
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

        $cacheKey = 'password_reset_otp_' . $validated['phone'];
        $cachedOtp = Cache::get($cacheKey);

        if (!$cachedOtp || $cachedOtp !== $validated['otp']) {
            return response()->json(['message' => 'Kode OTP tidak valid atau telah kedaluwarsa.'], 400);
        }

        $user = User::where('phone', $validated['phone'])->whereNotNull('phone_verified_at')->first();

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