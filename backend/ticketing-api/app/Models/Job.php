<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Job extends Model {
    use HasFactory;
    protected $fillable = ['title', 'status', 'worker_id']; // Izinkan mass-assignment
    public function worker() {
        return $this->belongsTo(Worker::class);
    }
}
