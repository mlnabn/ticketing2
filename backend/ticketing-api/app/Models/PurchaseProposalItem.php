<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PurchaseProposalItem extends Model
{
    use HasFactory;

    protected $fillable = [
        'purchase_proposal_id',
        'master_barang_id',
        'quantity',
        'estimated_price',
        'link',
        'notes',
    ];

    protected $casts = [
        'estimated_price' => 'float',
    ];

    public function proposal()
    {
        return $this->belongsTo(PurchaseProposal::class, 'purchase_proposal_id');
    }

    public function masterBarang()
    {
        // Memuat info barang terkait
        return $this->belongsTo(MasterBarang::class, 'master_barang_id')
                    ->with(['masterKategori', 'subKategori']);
    }
}