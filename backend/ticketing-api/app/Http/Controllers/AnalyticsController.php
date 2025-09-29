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
        // Tentukan rentang tanggal 30 hari
        $endDate = Carbon::now();
        $startDate = Carbon::now()->subDays(29)->startOfDay();

        // 🚀 OPTIMASI: Satu Query untuk semua status
        $results = Ticket::select(
                DB::raw('DATE(created_at) as date'),
                DB::raw("SUM(CASE WHEN status = 'Belum Dikerjakan' THEN 1 ELSE 0 END) as belum"),
                DB::raw("SUM(CASE WHEN status = 'Sedang Dikerjakan' OR status = 'Ditunda' THEN 1 ELSE 0 END) as sedang"),
                DB::raw("SUM(CASE WHEN status = 'Selesai' THEN 1 ELSE 0 END) as selesai"),
                DB::raw("SUM(CASE WHEN status = 'Ditolak' THEN 1 ELSE 0 END) as ditolak")
            )
            ->whereBetween('created_at', [$startDate, $endDate])
            ->groupBy('date')
            ->orderBy('date', 'asc')
            ->get()
            ->keyBy('date'); // Jadikan tanggal sebagai key untuk akses mudah

        $analyticsData = [];
        // Buat array tanggal 30 hari terakhir
        for ($i = 29; $i >= 0; $i--) {
            $date = Carbon::now()->subDays($i)->format('Y-m-d');
            
            // Cek apakah ada data dari query untuk tanggal ini
            if (isset($results[$date])) {
                $analyticsData[] = [
                    'date'    => $date,
                    'belum'   => (int) $results[$date]->belum,
                    'sedang'  => (int) $results[$date]->sedang,
                    'selesai' => (int) $results[$date]->selesai,
                    'ditolak' => (int) $results[$date]->ditolak,
                ];
            } else {
                // Jika tidak ada, isi dengan nol
                $analyticsData[] = [
                    'date'    => $date,
                    'belum'   => 0,
                    'sedang'  => 0,
                    'selesai' => 0,
                    'ditolak' => 0,
                ];
            }
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
