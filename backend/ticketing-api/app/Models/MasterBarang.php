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
        'merk',
        'model_barang',
        'status_barang',
        'tanggal_pembelian',
        'tanggal_masuk',
        'digunakan_untuk',
        'stok',
        'harga_barang',
        'warna',
    ];

    /**
     * Relasi ke MasterKategori.
     * Didefinisikan secara eksplisit untuk kejelasan.
     */
    public function masterKategori()
    {
        // Argumen kedua: foreign key di tabel ini ('master_barangs')
        // Argumen ketiga: owner key di tabel tujuan ('master_kategoris')
        return $this->belongsTo(MasterKategori::class, 'id_kategori', 'id_kategori');
    }

    /**
     * Relasi ke SubKategori.
     * Didefinisikan secara eksplisit untuk kejelasan.
     */
    public function subKategori()
    {
        return $this->belongsTo(SubKategori::class, 'id_sub_kategori', 'id_sub_kategori');
    }

    /**
     * Relasi ke Tool.
     */
    public function tool()
    {
        return $this->hasOne(Tool::class, 'name', 'nama_barang');
    }
}
