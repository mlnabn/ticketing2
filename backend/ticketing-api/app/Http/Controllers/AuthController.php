<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Laravel\Socialite\Facades\Socialite;
use Tymon\JWTAuth\Facades\JWTAuth;
use Carbon\Carbon;
use Illuminate\Support\Facades\Http;
use Exception;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Cache;
use Illuminate\Validation\Rule;

class AuthController extends Controller
{
    // ... (fungsi register tidak berubah) ...
    public function register(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            // Pastikan email unik hanya jika akun sudah terverifikasi
            'email' => [
                'required', 'string', 'email', 'max:255',
                Rule::unique('users')->where(fn ($query) => $query->whereNotNull('phone_verified_at'))
            ],
            'password' => 'required|string|min:6|confirmed',
            // Pastikan nomor telepon unik hanya jika akun sudah terverifikasi
            'phone' => [
                'required', 'string', 'min:10',
                Rule::unique('users')->where(fn ($query) => $query->whereNotNull('phone_verified_at'))
            ],
        ]);

        $otpCode = (string) rand(100000, 999999);
        $otpExpiresAt = Carbon::now()->addMinutes(5);

        $registrationData = [
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']), // Hash password sebelum disimpan
            'phone' => $validated['phone'],
            'otp_code' => $otpCode,
            'otp_expires_at' => $otpExpiresAt,
        ];

        Cache::put('registration_data_' . $validated['phone'], $registrationData, now()->addMinutes(10));

        $n8nWebhookUrl = env('N8N_WEBHOOK_URL', 'http://localhost:5678/webhook/whatsapp-otp');
        try {
            Http::get($n8nWebhookUrl, ['phone' => $validated['phone'], 'otp' => $otpCode]);
        } catch (\Exception $e) {
            // Jika gagal kirim OTP, hapus cache agar tidak ada data menggantung
            Cache::forget('registration_data_' . $validated['phone']);
            return response()->json(['message' => 'Gagal mengirim OTP. Silakan coba lagi.'], 503);
        }

        // 5. Beri respons bahwa OTP telah dikirim
        return response()->json([
            'message' => 'Kode verifikasi telah dikirim. Silakan cek WhatsApp Anda.',
            'phone' => $validated['phone']
        ], 200);
    }

    public function resendOtp(Request $request)
    {
        $validated = $request->validate(['phone' => 'required|string']);
        $phone = $validated['phone'];
        $cacheKey = 'registration_data_' . $phone;

        if (!Cache::has($cacheKey)) {
            return response()->json(['message' => 'Sesi registrasi tidak ditemukan atau telah kedaluwarsa. Silakan mulai dari awal.'], 404);
        }

        $registrationData = Cache::get($cacheKey);
        $registrationData['otp_code'] = (string) rand(100000, 999999); 
        $registrationData['otp_expires_at'] = Carbon::now()->addMinutes(5);
        Cache::put($cacheKey, $registrationData, now()->addMinutes(10));

        $n8nWebhookUrl = env('N8N_WEBHOOK_URL', 'http://localhost:5678/webhook/whatsapp-otp');
        try {
            Http::get($n8nWebhookUrl, ['phone' => $phone, 'otp' => $registrationData['otp_code']]);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Gagal mengirim OTP. Silakan coba lagi nanti.'], 503);
        }

        return response()->json(['message' => 'Kode OTP baru telah dikirim ke nomor Anda.']);
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

        return $this->respondWithToken($access_token, auth('api')->user());
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
        return $this->respondWithToken(auth('api')->refresh(), auth('api')->user());
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

            return redirect(env('FRONTEND_URL', 'http://localhost:3000') . '?access_token=' . $access_token . '&user=' . $user_param . '&expires_in=' . $expires_in);

        } catch (Exception $e) {
            \Log::error('Google Callback Error: ' . $e->getMessage());
            return redirect(env('FRONTEND_URL', 'http://localhost:3000') . '/login?error=google_auth_failed');
        }
    }

    /**
     * Fungsi helper untuk membuat format respons token yang konsisten.
     * (Fungsi ini sudah benar)
     */
    public function respondWithToken($access_token, $user)
    {
        // $user = auth('api')->user();
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