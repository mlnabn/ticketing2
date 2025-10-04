<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SubKategori extends Model
{
    use HasFactory;

    protected $primaryKey = 'id_sub_kategori';

    protected $fillable = [
        'id_kategori',
        'nama_sub',
    ];

    public function masterKategori()
    {
        return $this->belongsTo(MasterKategori::class, 'id_kategori');
    }

    public function masterBarangs()
    {
        return $this->hasMany(MasterBarang::class, 'id_sub_kategori');
    }
}
