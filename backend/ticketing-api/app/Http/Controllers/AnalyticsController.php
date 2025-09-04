<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Ticket;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Exception;

class AnalyticsController extends Controller
{
    /**
     * Get ticket analytics data for charts.
     */
    public function getTicketAnalytics()
    {
        // Mendapatkan data tiket 30 hari terakhir
        $tickets = Ticket::where('created_at', '>=', Carbon::now()->subDays(30))
            ->get()
            ->groupBy(function($date) {
                return Carbon::parse($date->created_at)->format('Y-m-d');
            });

        $analyticsData = [];
        for ($i = 29; $i >= 0; $i--) {
            $date = Carbon::now()->subDays($i)->format('Y-m-d');
            $ticketsOnDate = $tickets[$date] ?? collect();

            $created = $ticketsOnDate->count();
            $completed = $ticketsOnDate->where('status', 'Selesai')->count();
            $rejected = $ticketsOnDate->where('status', 'Ditolak')->count();

            $analyticsData[] = [
                'date' => $date,
                'created' => $created,
                'completed' => $completed,
                'rejected' => $rejected,
            ];
        }

        return response()->json($analyticsData);
    }

    /**
     * Get admin performance data for charts.
     */
    public function getAdminPerformance()
    {
        try {
            // Ambil semua pengguna dengan peran 'admin' atau 'super-admin'
            $admins = User::whereIn('role', ['admin', 'super-admin'])->get();
    
            // PERBAIKAN: Menggunakan 'user_id' bukan 'admin_id' atau 'assigned_to'
            $data = $admins->map(function ($admin) {
                $completedTickets = Ticket::where('user_id', $admin->id)
                    ->where('status', 'Selesai')
                    ->count();

                // Tambahkan perhitungan tiket yang ditolak
                $rejectedTickets = Ticket::where('user_id', $admin->id)
                    ->where('status', 'Ditolak')
                    ->count();
    
                return [
                    'name' => $admin->name,
                    'ticketsCompleted' => $completedTickets,
                    'ticketsRejected' => $rejectedTickets
                ];
            });
    
            return response()->json($data);

        } catch (Exception $e) {
            // Tangkap dan kembalikan pesan error yang jelas
            return response()->json(['error' => 'Gagal mengambil data performa admin: ' . $e->getMessage()], 500);
        }
    }
}