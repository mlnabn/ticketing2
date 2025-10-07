<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class StokBarang extends Model {
    use HasFactory;
    protected $fillable = [
        'master_barang_id', 'kode_unik', 'serial_number', 'status',
        'tanggal_pembelian', 'tanggal_masuk', 'tanggal_keluar',
        'harga_beli', 'warna', 'kondisi'
    ];
    
    public function masterBarang() {
        return $this->belongsTo(MasterBarang::class, 'master_barang_id');
    }
}