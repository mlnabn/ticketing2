<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Support\Facades\Validator;
use Carbon\Carbon;
use Tymon\JWTAuth\Facades\JWTAuth;

class OtpController extends Controller
{
    /**
     * Memverifikasi OTP dan memberikan token JWT jika berhasil.
     */
    public function verifyOtp(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'phone' => 'required|string|exists:users,phone',
            'otp' => 'required|string|min:6|max:6',
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 422);
        }

        $user = User::where('phone', $request->phone)->first();

        // Cek jika user sudah terverifikasi sebelumnya
        if ($user->phone_verified_at) {
            return response()->json(['message' => 'Nomor ini sudah terverifikasi.'], 400);
        }

        if (!$user || $user->otp_code !== $request->otp) {
            return response()->json(['message' => 'Kode OTP salah.'], 401);
        }

        if (Carbon::now()->isAfter($user->otp_expires_at)) {
            return response()->json(['message' => 'Kode OTP telah kedaluwarsa.'], 401);
        }

        // Verifikasi berhasil:
        $user->phone_verified_at = Carbon::now();
        $user->otp_code = null;
        $user->otp_expires_at = null;
        $user->save();

        // Buat token JWT untuk login otomatis
        $token = JWTAuth::fromUser($user);

        return response()->json([
            'message' => 'Verifikasi berhasil! Selamat datang.',
            'access_token' => $token,
            'token_type' => 'bearer',
            'user' => $user
        ]);
    }
}