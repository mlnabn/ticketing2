<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Ticket;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Exception;

class AnalyticsController extends Controller
{
    /**
     * Get ticket analytics data for charts (30 hari terakhir).
     */
    public function getTicketAnalytics()
    {
        $analyticsData = [];

        for ($i = 29; $i >= 0; $i--) {
            $date = Carbon::now()->subDays($i)->format('Y-m-d');

            $belum = Ticket::where('status', 'Belum Dikerjakan')
                ->whereDate('created_at', $date)
                ->count();

            $sedang = Ticket::whereIn('status', ['Sedang Dikerjakan', 'Ditunda'])
                ->whereDate('updated_at', $date)
                ->count();

            $selesai = Ticket::where('status', 'Selesai')
                ->whereDate('completed_at', $date)
                ->count();

            $ditolak = Ticket::where('status', 'Ditolak')
                ->whereDate('completed_at', $date) // ✅ pakai completed_at biar konsisten
                ->count();

            $analyticsData[] = [
                'date'   => $date,
                'belum'  => $belum,
                'sedang' => $sedang,
                'selesai'=> $selesai,
                'ditolak'=> $ditolak,
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
            $data = Ticket::select(
                'user_id',
                DB::raw("SUM(CASE WHEN status = 'Selesai' THEN 1 ELSE 0 END) as ticketsCompleted"),
                DB::raw("SUM(CASE WHEN status = 'Ditolak' THEN 1 ELSE 0 END) as ticketsRejected"),
                DB::raw("SUM(CASE WHEN status = 'Sedang Dikerjakan' OR status = 'Ditunda' THEN 1 ELSE 0 END) as ticketsInProgress"),
                DB::raw("COUNT(*) as totalTickets")
            )
                ->whereNotNull('user_id')
                ->groupBy('user_id')
                ->with('user:id,name')
                ->get()
                ->map(function ($row) {
                    return [
                        'id'               => $row->user_id,
                        'name'             => $row->user->name ?? 'Unknown',
                        'ticketsCompleted' => (int) $row->ticketsCompleted, // hanya selesai
                        'ticketsRejected'  => (int) $row->ticketsRejected,  // ditolak terpisah
                        'ticketsInProgress'=> (int) $row->ticketsInProgress,
                        'totalTickets'     => (int) $row->totalTickets,
                    ];
                });

            return response()->json($data);
        } catch (Exception $e) {
            return response()->json([
                'error' => 'Gagal mengambil data performa admin: ' . $e->getMessage()
            ], 500);
        }
    }
}
