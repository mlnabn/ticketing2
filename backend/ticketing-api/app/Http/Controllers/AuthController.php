<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str; // Import Str
use Laravel\Socialite\Facades\Socialite;
use Tymon\JWTAuth\Facades\JWTAuth;
use Tymon\JWTAuth\Exceptions\JWTException;
use Carbon\Carbon;
use Illuminate\Support\Facades\Http;
use Exception;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;


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

        // ✅ Ambil user yang login
        $user = auth()->user();

        return response()->json([
            'token'      => $token,
            'user'       => [
                'id'         => $user->id,
                'name'       => $user->name,
                'email'      => $user->email,
                'phone'      => $user->phone,
                'role'       => $user->role, // ⬅️ tambahkan role
                'avatar_url' => $user->avatar ? asset('storage/' . $user->avatar) : null,
            ],
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
            $user = auth('api')->user();
            if (!$user) {
                return response()->json(['error' => 'User not found'], 404);
            }

            return response()->json([
                'id'         => $user->id,
                'name'       => $user->name,
                'email'      => $user->email,
                'phone'      => $user->phone,
                'role'       => $user->role, // ⬅️ tambahkan role juga di sini
                'avatar_url' => $user->avatar ? asset('storage/' . $user->avatar) : null,
            ]);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Failed to fetch user profile'], 500);
        }
    }


    public function updateUser(Request $request)
    {
        $user = auth('api')->user(); // pakai guard api

        if (!$user) {
            return response()->json(['error' => 'User not found'], 404);
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => [
                'required',
                'string',
                'email',
                'max:255',
                Rule::unique('users')->ignore($user->id),
            ],
            'phone' => [
                'required',
                'string',
                'min:10',
                Rule::unique('users')->ignore($user->id),
            ],

            'password' => 'nullable|string|min:8|confirmed',
            'avatar'   => 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:2048',
        ]);

        // update basic fields
        $user->name  = $validated['name'];
        $user->email = $validated['email'];
        $user->phone = $validated['phone'];

        if (!empty($validated['password'])) {
            $user->password = bcrypt($validated['password']);
        }

        // ✅ handle hapus avatar (kalau ada flag dari frontend)
        if ($request->has('avatar_remove') && $request->avatar_remove == 1) {
            if ($user->avatar && Storage::disk('public')->exists($user->avatar)) {
                Storage::disk('public')->delete($user->avatar);
            }
            $user->avatar = null;
        }

        // handle avatar
        if ($request->hasFile('avatar')) {
            // hapus avatar lama kalau ada
            if ($user->avatar) {
                Storage::disk('public')->delete($user->avatar);
            }

            $path = $request->file('avatar')->store('avatars', 'public');
            $user->avatar = $path;
        }

        $user->save();

        return response()->json([
            'id'         => $user->id,
            'name'       => $user->name,
            'email'      => $user->email,
            'phone'      => $user->phone,
            'avatar_url' => $user->avatar ? asset('storage/' . $user->avatar) : null,
        ]);
    }

    public function redirectToGoogle()
    {
        return Socialite::driver('google')
            ->stateless()
            ->with(['prompt' => 'select_account'])
            ->redirect();
    }

    /**
     * Menangani callback dari Google setelah otentikasi.
     */
    public function handleGoogleCallback()
    {
        try {
            $googleUser = Socialite::driver('google')->stateless()->user();

            // Menggunakan firstOrNew untuk mendapatkan instance user, baik baru maupun yang sudah ada
            $user = User::firstOrNew(['email' => $googleUser->getEmail()]);

            // Isi atau update data
            $user->name = $googleUser->getName();
            $user->google_id = $googleUser->getId();
            $user->avatar = $googleUser->getAvatar();

            // Jika user baru (belum ada di DB), beri password acak dan role default
            if (!$user->exists) {
                $user->password = Hash::make(Str::random(24));
                $user->role = 'user'; // Atur role default untuk pendaftar baru via Google
            }

            $user->save(); // Simpan perubahan atau user baru

            // Buat token JWT untuk user tersebut
            $token = JWTAuth::fromUser($user);

            // PERBAIKAN: Kirim token DAN user object yang sudah di-encode ke frontend
            // Ini akan menyamakan alur data dengan login manual
            $user_data = urlencode(json_encode($user));

            return redirect('http://localhost:3000?token=' . $token . '&user=' . $user_data);
        } catch (Exception $e) {
            // Log error untuk debugging di sisi server
            \Log::error('Google Callback Error: ' . $e->getMessage());
            return redirect('http://localhost:3000/login?error=google_auth_failed');
        }
    }
}
