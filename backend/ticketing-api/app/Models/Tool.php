<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Tool extends Model
{
    use HasFactory;

    protected $fillable = ['name', 'description', 'stock'];

    public function tickets()
    {
        return $this->belongsToMany(Ticket::class)
            ->withPivot('quantity_used', 'quantity_lost', 'status', 'keterangan')
            ->withTimestamps();
    }
}
