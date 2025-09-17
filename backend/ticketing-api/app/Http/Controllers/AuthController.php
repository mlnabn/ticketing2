<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth;
use Tymon\JWTAuth\Facades\JWTAuth;
use Tymon\JWTAuth\Exceptions\JWTException;
use Carbon\Carbon;
use Illuminate\Support\Facades\Http;

class AuthController extends Controller
{
    public function register(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:6|confirmed',
            'phone' => 'required|string|min:10|unique:users',
        ]);

         $otpCode = rand(100000, 999999);
        $otpExpiresAt = Carbon::now()->addMinutes(5);

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'phone' => $request->phone,
            'role' => 'user', // secara default user biasa
            'otp_code' => $otpCode, // Simpan OTP
            'otp_expires_at' => $otpExpiresAt,
        ]);

        $n8nWebhookUrl = 'http://localhost:5678/webhook/whatsapp-otp';

        try {
            Http::get($n8nWebhookUrl, [
                'phone' => $user->phone,
                'otp' => $otpCode,
            ]);
        } catch (\Exception $e) {
            $user->delete(); 
            return response()->json(['message' => 'Gagal mengirim OTP. Silakan coba lagi.'], 503);
        }

        return response()->json([
            'message' => 'Registrasi berhasil. Silakan cek WhatsApp Anda untuk kode verifikasi.',
            'phone' => $user->phone
        ], 201);
    }


    public function login(Request $request)
    {
        $credentials = $request->only('email', 'password');

        try {
            if (!$token = JWTAuth::attempt($credentials)) {
                return response()->json(['error' => 'Invalid credentials'], 401);
            }
        } catch (JWTException $e) {
            return response()->json(['error' => 'Could not create token'], 500);
        }

        // ✅ AMBIL DATA USER YANG BERHASIL LOGIN
        $user = auth()->user();

        // ✅ KEMBALIKAN RESPON LENGKAP DENGAN DATA USER
        return response()->json([
            'token'      => $token,
            'user'       => $user, // <-- INI BARIS KUNCINYA
            'expires_in' => auth('api')->factory()->getTTL() * 60,
        ]);
    }

    public function logout()
    {
        try {
            JWTAuth::invalidate(JWTAuth::getToken());
        } catch (JWTException $e) {
            return response()->json(['error' => 'Failed to logout, please try again'], 500);
        }

        return response()->json(['message' => 'Successfully logged out']);
    }

    public function getUser()
    {
        try {
            $user = Auth::user();
            if (!$user) {
                return response()->json(['error' => 'User not found'], 404);
            }
            return response()->json($user);
        } catch (JWTException $e) {
            return response()->json(['error' => 'Failed to fetch user profile'], 500);
        }
    }

    public function updateUser(Request $request)
    {
        try {
            $user = Auth::user();
            $user->update($request->only(['name', 'email']));
            return response()->json($user);
        } catch (JWTException $e) {
            return response()->json(['error' => 'Failed to update user'], 500);
        }
    }
}