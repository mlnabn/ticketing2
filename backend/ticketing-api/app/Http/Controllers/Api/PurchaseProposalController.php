<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\PurchaseProposal;
use App\Models\PurchaseProposalItem;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Maatwebsite\Excel\Facades\Excel;
use Barryvdh\DomPDF\Facade\Pdf;
use App\Exports\PurchaseProposalExport;

class PurchaseProposalController extends Controller
{
    public function index()
    {
        $proposals = PurchaseProposal::with('createdByUser:id,name')
            ->select('id', 'title', 'created_by', 'total_estimated_cost', 'status', 'created_at')
            ->latest()
            ->paginate(20);
            
        return $proposals;
    }

    public function store(Request $request)
    {
        $itemsInput = $request->input('items', []);
        $parsedItems = [];
        $totalEstimatedCost = 0;

        foreach ($itemsInput as $item) {
            $numericPrice = (int) preg_replace('/[^\d]/', '', $item['estimated_price'] ?? 0);
            
            $parsedItems[] = [
                'master_barang_id' => $item['master_barang_id'] ?? null,
                'quantity' => $item['quantity'] ?? 1,
                'estimated_price' => $numericPrice, 
                'link' => $item['link'] ?? null,
                'notes' => $item['notes'] ?? null,
            ];
            $totalEstimatedCost += $numericPrice * ($item['quantity'] ?? 1);
        }

        $validated = $request->validate([
            'title' => 'required|string|max:255',
        ]);
        $itemsValidator = \Illuminate\Support\Facades\Validator::make(['items' => $parsedItems], [
            'items' => 'required|array|min:1',
            'items.*.master_barang_id' => 'required|exists:master_barangs,id_m_barang',
            'items.*.quantity' => 'required|integer|min:1',
            'items.*.estimated_price' => 'required|numeric|min:0',
            'items.*.link' => 'nullable|string|max:2048',
            'items.*.notes' => 'nullable|string',
        ]);
        if ($itemsValidator->fails()) {
            return response()->json($itemsValidator->errors(), 422);
        }

        $proposal = DB::transaction(function () use ($validated, $parsedItems, $totalEstimatedCost) {
            $newProposal = PurchaseProposal::create([
                'title' => $validated['title'],
                'created_by' => Auth::id(),
                'total_estimated_cost' => $totalEstimatedCost,
                'status' => 'draft',
            ]);

            foreach ($parsedItems as $itemData) {
                $newProposal->items()->create($itemData);
            }
            return $newProposal;
        });

        return response()->json($proposal->load('items'), 201);
    }

    public function show(PurchaseProposal $purchaseProposal)
    {
        return $purchaseProposal->load([
            'createdByUser:id,name',
            'items.masterBarang' 
        ]);
    }

    public function update(Request $request, PurchaseProposal $purchaseProposal)
    {
        // Logika update bisa ditambahkan di sini jika diperlukan
        // ...
        return response()->json(null, 204);
    }

    // Menghapus catatan pengajuan
    public function destroy(PurchaseProposal $purchaseProposal)
    {
        $purchaseProposal->delete();
        return response()->json(['message' => 'Catatan pengajuan berhasil dihapus.'], 200);
    }

    public function export(Request $request, PurchaseProposal $purchaseProposal)
    {
        $request->validate([
            'type' => 'required|in:excel,pdf',
        ]);
        $fileName = 'proposal-' . preg_replace('/[^A-Za-z0-9\-]/', '', $purchaseProposal->title);
        $proposalData = $purchaseProposal->load([
            'createdByUser:id,name',
            'items.masterBarang.masterKategori',
            'items.masterBarang.subKategori'
        ]);

        if ($request->type === 'excel') {
            return Excel::download(new PurchaseProposalExport($proposalData), $fileName . '.xlsx');
        }

        if ($request->type === 'pdf') {
            $pdf = PDF::loadView('reports.purchase_proposal_pdf', ['proposal' => $proposalData]);
            return $pdf->download($fileName . '.pdf');
        }
    }
}