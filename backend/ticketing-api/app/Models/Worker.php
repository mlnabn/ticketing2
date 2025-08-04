<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Worker extends Model
{
    protected $fillable = ['name'];

    public function tickets() { // <-- Diubah dari jobs()
    return $this->hasMany(Ticket::class); // <-- Diubah dari Job::class
}
}
