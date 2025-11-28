<?php

namespace App\Http\Middleware;

use Closure;
use Tymon\JWTAuth\Facades\JWTAuth;
use Tymon\JWTAuth\Exceptions\TokenExpiredException;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class JwtMiddleware
{
    public function handle(Request $request, Closure $next)
    {
        if ($request->hasCookie('access_token')) {
            $token = $request->cookie('access_token');
            $request->headers->set('Authorization', 'Bearer ' . $token);
        }

        try {
            JWTAuth::parseToken()->authenticate();
        } catch (Exception $e) {
            if ($e instanceof TokenExpiredException) {
                if ($request->is('api/auth/refresh') || $request->is('api/refresh')) {
                    return $next($request); 
                }
            }
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        return $next($request);
    }
}