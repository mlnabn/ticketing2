<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Storage;

class Ticket extends Model
{
    use HasFactory;
    protected $appends = ['proof_image_url'];

    protected $fillable = [
        'title',
        'status',
        'user_id',
        'workshop_id',
        'creator_id',
        'started_at',
        'completed_at',
        'requested_time',
        'requested_date',
        'rejection_reason',
        'proof_description',
        'proof_image_path',
        'kode_tiket',
        'requester_name', // <-- PERBAIKAN 3: Ditambahkan
    ];

    public function user()
    {
        // PERBAIKAN 2: Foreign key dibuat eksplisit
        return $this->belongsTo(User::class, 'user_id');
    }

    public function workshop()
    {
        return $this->belongsTo(Workshop::class);
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'creator_id');
    }

    public function getProofImageUrlAttribute()
    {
        if ($this->proof_image_path) {
            return Storage::disk('public')->url($this->proof_image_path);
        }
        return null;
    }

    public function tools()
    {
        return $this->belongsToMany(Tool::class)
            ->withPivot('quantity_used', 'quantity_lost', 'status', 'keterangan')
            ->withTimestamps();
    }
}
