<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Status extends Model {
    use HasFactory;
    protected $table = 'status_barang';
    protected $fillable = ['nama_status', 'warna_badge'];
}