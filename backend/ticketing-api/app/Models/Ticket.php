<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Ticket extends Model
{
    use HasFactory;

    protected $fillable = ['title', 'status', 'user_id', 'workshop', 'creator_id', 'started_at', 'completed_at', 'requested_time'];

    public function user() {
        return $this->belongsTo(User::class);
    }

    public function creator()
    {
        // Pastikan parameter kedua 'creator_id' ada
        return $this->belongsTo(User::class, 'creator_id');
    }
}