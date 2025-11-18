<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Workshop extends Model
{
    use HasFactory;

    protected $fillable = ['name', 'code', 'lat', 'lng', 'description', 'url'];

    protected $casts = [
        'lat' => 'float',
        'lng' => 'float',
    ];  
    
    public function tickets()
    {
        return $this->hasMany(Ticket::class);
    }
}
