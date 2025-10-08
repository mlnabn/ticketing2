<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class StokBarang extends Model
{
    use HasFactory;
    protected $fillable = [
        'master_barang_id',
        'kode_unik',
        'serial_number',
        'status_id',
        'tanggal_pembelian',
        'tanggal_masuk',
        'tanggal_keluar',
        'harga_beli',
        'id_warna',
        'kondisi',
        'user_peminjam_id',
        'workshop_id',
        'created_by',
    ];

    public function statusDetail() {
        return $this->belongsTo(Status::class, 'status_id');
    }

    public function userPeminjam() {
        return $this->belongsTo(User::class, 'user_peminjam_id');
    }

    public function workshop() {
        return $this->belongsTo(Workshop::class, 'workshop_id');
    }

    public function createdBy() {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function updatedBy() {
        return $this->belongsTo(User::class, 'updated_by');
    }

    public function masterBarang()
    {
        return $this->belongsTo(MasterBarang::class, 'master_barang_id');
    }
    public function color()
    {
        return $this->belongsTo(Color::class, 'id_warna');
    }
}
