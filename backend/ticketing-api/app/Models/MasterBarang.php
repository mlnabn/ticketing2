<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class MasterBarang extends Model
{
    use HasFactory;
    protected $primaryKey = 'id_m_barang';

    protected $fillable = [
        'id_kategori',
        'id_sub_kategori',
        'kode_barang',
        'nama_barang',
        'model_barang',
        'harga_barang',
        'created_by',
    ];

    public function masterKategori()
    {
        return $this->belongsTo(MasterKategori::class, 'id_kategori', 'id_kategori');
    }
    public function subKategori()
    {
        return $this->belongsTo(SubKategori::class, 'id_sub_kategori', 'id_sub_kategori');
    }

    public function stokBarangs()
    {
        return $this->hasMany(StokBarang::class, 'master_barang_id');
    }

    public function tickets()
    {
        // Relasi ini mungkin perlu disesuaikan nanti, untuk saat ini biarkan
        return $this->belongsToMany(Ticket::class, 'ticket_master_barang', 'master_barang_id', 'ticket_id')
            ->withPivot('quantity_used', 'status', 'keterangan', 'quantity_lost', 'quantity_recovered')
            ->withTimestamps();
    }
    public function createdBy()
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}
