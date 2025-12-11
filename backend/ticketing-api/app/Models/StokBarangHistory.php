<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class StokBarangHistory extends Model
{
    use HasFactory;
    protected $fillable = [
        'stok_barang_id', 'status_id', 'deskripsi',
        'triggered_by_user_id', 'related_user_id', 'workshop_id',
        'event_date', 'bukti_foto_path',
    ];

    protected function casts(): array
    {
        return [
            'event_date' => 'date:Y-m-d',
        ];
    }

    public function stokBarang(){return $this->belongsTo(StokBarang::class, 'stok_barang_id');}
    public function statusDetail() { return $this->belongsTo(Status::class, 'status_id'); }
    public function triggeredByUser() { return $this->belongsTo(User::class, 'triggered_by_user_id'); }
    public function relatedUser() { return $this->belongsTo(User::class, 'related_user_id'); }
    public function workshop() { return $this->belongsTo(Workshop::class); }

    public function previousStatusDetail()
    {
        return $this->belongsTo(Status::class, 'previous_status_id', 'id');
    }
}