<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Color extends Model
{
    protected $primaryKey = 'id_warna';
    protected $fillable = ['nama_warna', 'kode_hex'];

    public function stokBarangs()
    {
        return $this->hasMany(StokBarang::class, 'id_warna');
    }
}
