<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class StokBarang extends Model
{
    use HasFactory;
    protected $fillable = [
        'master_barang_id', 'kode_unik', 'serial_number', 'status_id', 'ticket_id',
        'tanggal_pembelian', 'tanggal_masuk', 'tanggal_keluar',
        'harga_beli', 'id_warna', 'kondisi', 'user_peminjam_id', 'workshop_id', 'created_by',
        'deskripsi', 'teknisi_perbaikan_id', 'tanggal_mulai_perbaikan', 'tanggal_selesai_perbaikan',
        'user_perusak_id', 'tanggal_rusak', 'user_penghilang_id', 'tanggal_hilang', 'tanggal_ketemu',
    ];

    protected function casts(): array
    {
        return [
            'tanggal_pembelian' => 'date:Y-m-d',
            'tanggal_masuk' => 'date:Y-m-d',
            'tanggal_keluar' => 'date:Y-m-d',
            'tanggal_mulai_perbaikan' => 'date:Y-m-d',
            'tanggal_selesai_perbaikan' => 'date:Y-m-d',
            'tanggal_rusak' => 'date:Y-m-d',
            'tanggal_hilang' => 'date:Y-m-d',
            'tanggal_ketemu' => 'date:Y-m-d',
        ];
    }

    public function ticket() {
        return $this->belongsTo(Ticket::class, 'ticket_id');
    }

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
    public function teknisiPerbaikan()
    {
        return $this->belongsTo(User::class, 'teknisi_perbaikan_id');
    }

    public function userPerusak()
    {
        return $this->belongsTo(User::class, 'user_perusak_id');
    }
    public function userPenghilang()
    {
        return $this->belongsTo(User::class, 'user_penghilang_id');
    }
    public function histories()
    {
        return $this->hasMany(StokBarangHistory::class, 'stok_barang_id')->latest();
    }
}
