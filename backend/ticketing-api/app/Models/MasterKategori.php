<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class MasterKategori extends Model
{
    use HasFactory;

    protected $primaryKey = 'id_kategori';

    protected $fillable = [
        'kode_kategori',
        'nama_kategori',
    ];

    public function subKategoris()
    {
        return $this->hasMany(SubKategori::class, 'id_kategori');
    }

    public function masterBarangs()
    {
        return $this->hasMany(MasterBarang::class, 'id_kategori');
    }
}
