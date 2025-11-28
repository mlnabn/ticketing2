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
use Illuminate\Support\Facades\Cookie;
use Lcobucci\JWT\Signer\None;

class AuthController extends Controller
{
    public function register(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            
            'email' => [
                'required', 'string', 'email', 'max:255',
                Rule::unique('users')->where(fn ($query) => $query->whereNotNull('phone_verified_at'))
            ],
            'password' => 'required|string|min:6|confirmed',
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
            'password' => Hash::make($validated['password']),
            'phone' => $validated['phone'],
            'otp_code' => $otpCode,
            'otp_expires_at' => $otpExpiresAt,
        ];

        Cache::put('registration_data_' . $validated['phone'], $registrationData, now()->addMinutes(10));

        $n8nWebhookUrl = env('N8N_WEBHOOK_URL', 'http://localhost:5678/webhook/whatsapp-otp');
        try {
            Http::get($n8nWebhookUrl, ['phone' => $validated['phone'], 'otp' => $otpCode]);
        } catch (\Exception $e) {
            
            Cache::forget('registration_data_' . $validated['phone']);
            return response()->json(['message' => 'Gagal mengirim OTP. Silakan coba lagi.'], 503);
        }

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
        auth('api')->logout(); 
        $response = response()->json(['message' => 'Successfully logged out'], 200);

        $cookie = cookie(
            'access_token',
            null,
            -1,
            '/',
            config('session.domain'),
            config('session.secure'),
            true,
            config('session.same_site')
        );

        return $response->cookie($cookie);
    }

    /**
     * Fungsi refresh token (sudah benar).
     */
    public function refresh()
    {
        $access_token = auth('api')->refresh();
    
        $user = auth('api')->user();

        return $this->respondWithToken($access_token, $user);
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
        Log::info('--- Memulai Google Callback ---');
        try {
            $googleUser = Socialite::driver('google')->stateless()->user();
            Log::info('Google User berhasil diambil.', ['email' => $googleUser->getEmail()]);
            
            $user = User::firstOrNew(['email' => $googleUser->getEmail()]);
            if (!$user->exists) {
                $user->name = $googleUser->getName();
                $user->email_verified_at = Carbon::now();
                $user->save();
                Log::info('Pengguna baru dibuat.', ['id' => $user->id]);
            } else {
                 Log::info('Pengguna ditemukan di DB.', ['id' => $user->id]);
            }
            
            $access_token = JWTAuth::fromUser($user);
            Log::info('Access Token berhasil dibuat.', ['token_length' => strlen($access_token), 'token_ttl' => auth('api')->factory()->getTTL()]);

            $user_data_for_frontend = [
                'id'         => $user->id,
                'name'       => $user->name,
                'email'      => $user->email,
                'phone'      => $user->phone,
                'role'       => $user->role,
                'avatar_url' => $user->avatar,
            ];
            
            // 5. Buat URL Redirect ke Frontend
            $user_param = urlencode(json_encode($user_data_for_frontend));
            $frontend_url = env('FRONTEND_URL', 'http://localhost:3000');
            $redirect_url = $frontend_url . '/login?user=' . $user_param;
            $redirect_response = redirect($redirect_url);
            Log::info('URL Redirect berhasil dibuat.', ['url' => $redirect_url]);
            
            // 6. Buat dan Set Cookie
            $session_domain = env('SESSION_DOMAIN', 'localhost');;
            $cookie_secure = env('SESSION_SECURE_COOKIE', false);
            Log::info('Konfigurasi Cookie:', ['domain' => $session_domain ?? 'null', 'secure' => $cookie_secure, 'http_only' => true, 'same_site' => 'Lax']);

            $cookie = cookie(
                'access_token',
                $access_token,
                config('jwt.refresh_ttl', 20160),
                '/',
                config('session.domain'),
                config('session.secure'),
                true,
                config('session.same_site')
            );

            Log::info('Cookie telah di-queue (antrikan). Melakukan redirect...');
            return redirect($redirect_url)->withCookie($cookie);
        } catch (Exception $e) {
            Log::error('Google Callback Error: ' . $e->getMessage(), ['trace' => $e->getTraceAsString()]);
            return redirect(env('FRONTEND_URL', 'http://localhost:3000') . '/login?error=google_auth_failed');
        }
    }

    /**
     * Fungsi helper untuk membuat format respons token yang konsisten.
     * (Fungsi ini sudah benar)
     */
    public function respondWithToken($access_token, $user)
    {
        $expires_in = auth('api')->factory()->getTTL() * 60;
        $user_data = [
            'id'         => $user->id,
            'name'       => $user->name,
            'email'      => $user->email,
            'phone'      => $user->phone,
            'role'       => $user->role,
            'avatar_url' => $user->avatar ? asset('storage/' . $user->avatar) : null,
        ];

        $response = response()->json([
            'user'       => $user_data,
            'token_type' => 'bearer',
            'expires_in' => $expires_in,
        ]);
        $cookie = cookie(
            'access_token',
            $access_token,
            config('jwt.refresh_ttl', 20160),
            '/',
            config('session.domain'),
            config('session.secure'),
            true,
            config('session.same_site')
        );

        return $response->cookie($cookie);
    }
}