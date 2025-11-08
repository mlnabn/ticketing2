<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Builder;

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
        'created_by',
        'is_active',
    ];

    public function scopeActive(Builder $query): void
    {
        $query->where('is_active', true);
    }

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

    public function activeStokBarangs()
    {
        $endOfLifeStatuses = Status::whereIn('nama_status', ['Rusak', 'Hilang', 'Non-Aktif'])
            ->pluck('id');
            
        return $this->hasMany(StokBarang::class, 'master_barang_id')
            ->whereNotIn('status_id', $endOfLifeStatuses);
    }

    public function tickets()
    {
        return $this->belongsToMany(Ticket::class, 'ticket_master_barang', 'master_barang_id', 'ticket_id')
            ->withPivot('quantity_used', 'status', 'keterangan', 'quantity_lost', 'quantity_recovered')
            ->withTimestamps();
    }
    public function createdBy()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function getStokTersediaAttribute()
    {
        return $this->stokBarangs()->where('status_id', 1)->count(); 
    }
}
