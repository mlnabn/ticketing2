<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class ApiKeyMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next)
    {
        // Ambil API Key dari header permintaan
        $apiKey = $request->header('X-API-KEY');

        // Bandingkan dengan API Key yang ada di file .env
        if ($apiKey !== config('app.n8n_api_key')) {
            // Jika tidak cocok, tolak akses
            return response()->json(['message' => 'Unauthorized'], 401);
        }

        // Jika cocok, izinkan permintaan untuk melanjutkan
        return $next($request);
    }
}
