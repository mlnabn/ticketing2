<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use App\Http\Middleware\JwtMiddleware;


return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware) {
        //
        $middleware->alias([
            'jwt' => JwtMiddleware::class
        ]);

        // $middleware->handleCors(
        //     paths: ['api/*'], // Terapkan kebijakan CORS untuk semua rute yang berawalan 'api/'
        //     allowedOrigins: ['http://localhost:3000'], // Izinkan request dari alamat React Anda. Sesuaikan port jika berbeda.
        //     allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
        //     allowedMethods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS']
        // );

    })

    ->withExceptions(function (Exceptions $exceptions): void {
        //
    })->create();
