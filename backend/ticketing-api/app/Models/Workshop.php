<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Workshop extends Model
{
    use HasFactory;

    // BARU: Tentukan field yang bisa diisi
    protected $fillable = ['name', 'code'];
    
    // BARU: Definisikan relasi ke model Ticket
    public function tickets()
    {
        return $this->hasMany(Ticket::class);
    }
}
