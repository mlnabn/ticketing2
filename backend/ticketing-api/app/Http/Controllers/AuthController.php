<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
// HAPUS: use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;
use Laravel\Socialite\Facades\Socialite;
use Tymon\JWTAuth\Facades\JWTAuth;
// HAPUS: use Tymon\JWTAuth\Exceptions\JWTException;
use Carbon\Carbon;
use Illuminate\Support\Facades\Http;
use Exception;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;

class AuthController extends Controller
{
    // ... (fungsi register tidak berubah) ...
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
            'role' => 'user',
            'otp_code' => $otpCode,
            'otp_expires_at' => $otpExpiresAt,
        ]);

        $n8nWebhookUrl = 'http://localhost:5678/webhook/whatsapp-otp';

        try {
            Http::get($n8nWebhookUrl, ['phone' => $user->phone, 'otp' => $otpCode]);
        } catch (\Exception $e) {
            $user->delete();
            return response()->json(['message' => 'Gagal mengirim OTP. Silakan coba lagi.'], 503);
        }

        return response()->json([
            'message' => 'Registrasi berhasil. Silakan cek WhatsApp Anda untuk kode verifikasi.',
            'phone' => $user->phone
        ], 201);
    }

    /**
     * PERBAIKAN: Fungsi login sekarang memanggil helper respondWithToken.
     */
    public function login(Request $request)
    {
        $credentials = $request->only('email', 'password');

        if (! $access_token = auth('api')->attempt($credentials)) {
            return response()->json(['error' => 'Invalid credentials'], 401);
        }

        return $this->respondWithToken($access_token);
    }

    /**
     * PERBAIKAN: Fungsi logout sekarang menggunakan guard 'api'.
     */
    public function logout()
    {
        auth('api')->logout(); // Cara yang lebih modern dan konsisten
        return response()->json(['message' => 'Successfully logged out']);
    }

    /**
     * Fungsi refresh token (sudah benar).
     */
    public function refresh()
    {
        return $this->respondWithToken(auth('api')->refresh());
    }

    // ... (fungsi getUser, updateUser, dan Google tidak berubah) ...
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
                'role'       => $user->role,
                'avatar_url' => $user->avatar ? asset('storage/' . $user->avatar) : null,
            ]);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Failed to fetch user profile'], 500);
        }
    }

    public function updateUser(Request $request)
    {
        $user = auth('api')->user();
        if (!$user) {
            return response()->json(['error' => 'User not found'], 404);
        }
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => ['required','string','email','max:255',Rule::unique('users')->ignore($user->id)],
            'phone' => ['nullable','string','min:10',Rule::unique('users')->ignore($user->id)],
            'password' => 'nullable|string|min:8|confirmed',
            'avatar'   => 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:2048',
        ]);
        $user->name  = $validated['name'];
        $user->email = $validated['email'];
        $user->phone = $validated['phone'];
        if (!empty($validated['password'])) {
            $user->password = bcrypt($validated['password']);
        }
        if ($request->has('avatar_remove') && $request->avatar_remove == 1) {
            if ($user->avatar && Storage::disk('public')->exists($user->avatar)) {
                Storage::disk('public')->delete($user->avatar);
            }
            $user->avatar = null;
        }
        if ($request->hasFile('avatar')) {
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
            'role'       => $user->role,
            'avatar_url' => $user->avatar ? asset('storage/' . $user->avatar) : null,
        ]);
    }
    public function redirectToGoogle()
    {
        return Socialite::driver('google')->stateless()->with(['prompt' => 'select_account'])->redirect();
    }
    public function handleGoogleCallback()
    {
        try {
            $googleUser = Socialite::driver('google')->stateless()->user();
            $user = User::firstOrNew(['email' => $googleUser->getEmail()]);

            if (!$user->exists) {
                $user->name = $googleUser->getName();
                $user->google_id = $googleUser->getId();
                $user->avatar = $googleUser->getAvatar();
                $user->password = Hash::make(Str::random(24));
                $user->role = 'user';
                $user->save();
            }

            // Buat token dari user yang sudah ada atau yang baru dibuat
            $access_token = JWTAuth::fromUser($user);

            $expires_in = auth('api')->factory()->getTTL() * 60; // Dapatkan masa berlaku token (dalam detik)
            
            $user_data_for_frontend = [
                'id'         => $user->id,
                'name'       => $user->name,
                'email'      => $user->email,
                'phone'      => $user->phone,
                'role'       => $user->role,
                'avatar_url' => $user->avatar,
            ];
            
            $user_param = urlencode(json_encode($user_data_for_frontend));

            return redirect('http://localhost:3000?access_token=' . $access_token . '&user=' . $user_param . '&expires_in=' . $expires_in);

        } catch (Exception $e) {
            \Log::error('Google Callback Error: ' . $e->getMessage());
            return redirect('http://localhost:3000/login?error=google_auth_failed');
        }
    }

    /**
     * Fungsi helper untuk membuat format respons token yang konsisten.
     * (Fungsi ini sudah benar)
     */
    protected function respondWithToken($access_token)
    {
        $user = auth('api')->user();
        return response()->json([
            'access_token' => $access_token,
            'token_type'   => 'bearer',
            'expires_in'   => auth('api')->factory()->getTTL() * 60,
            'user'         => [
                'id'         => $user->id,
                'name'       => $user->name,
                'email'      => $user->email,
                'phone'      => $user->phone,
                'role'       => $user->role,
                'avatar_url' => $user->avatar ? asset('storage/' . $user->avatar) : null,
            ],
        ]);
    }
}