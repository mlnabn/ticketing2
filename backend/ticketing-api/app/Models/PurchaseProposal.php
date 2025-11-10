<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PurchaseProposal extends Model
{
    use HasFactory;

    protected $fillable = [
        'title',
        'created_by',
        'total_estimated_cost',
        'status',
    ];

    protected $casts = [
        'total_estimated_cost' => 'float',
    ];

    public function createdByUser()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function items()
    {
        return $this->hasMany(PurchaseProposalItem::class, 'purchase_proposal_id');
    }
}