<?php

namespace App\Http\Controllers;

use App\Models\Ticket;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Http\Controllers\LocationController;

class DashboardController extends Controller
{
    public function getBootstrapData(Request $request)
    {
        $user = Auth::user();
        if ($user->role !== 'admin') {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $ticketController = new \App\Http\Controllers\Api\TicketController();
        $analyticsController = new AnalyticsController();
        $userController = new \App\Http\Controllers\Api\UserController();
        $locationController = new LocationController();
        $ticketsResponse = $ticketController->index($request);
        
        // Panggil data lainnya
        $statsResponse = $ticketController->stats();
        $analyticsResponse = $analyticsController->getTicketAnalytics();
        $adminPerformanceResponse = $analyticsController->getAdminPerformance();
        $allTicketsResponse = $ticketController->allTickets();
        $adminsResponse = $userController->getAdmins();
        $locationsResponse = $locationController->index();

        return response()->json([
            'tickets' => json_decode($ticketsResponse->getContent(), true),
            'stats' => json_decode($statsResponse->getContent(), true),
            'analyticsData' => json_decode($analyticsResponse->getContent(), true),
            'adminPerformance' => json_decode($adminPerformanceResponse->getContent(), true),
            'allTicketsForCalendar' => json_decode($allTicketsResponse->getContent(), true),
            'admins' => json_decode($adminsResponse->getContent(), true),
            'locations' => json_decode($locationsResponse->getContent(), true),
        ]);
    }
}