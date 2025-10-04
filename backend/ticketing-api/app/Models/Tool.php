<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Tool extends Model
{
    use HasFactory;

    protected $fillable = ['name', 'description'];

    public function tickets()
    {
        // Menghubungkan ke tabel pivot 'ticket_tool'
        return $this->belongsToMany(Ticket::class, 'ticket_tool')
            ->withPivot('quantity_used', 'status', 'keterangan', 'quantity_lost', 'quantity_recovered')
            ->withTimestamps();
    }
}
