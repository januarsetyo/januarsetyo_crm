<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Product extends Model
{
    protected $table = 'product';
    protected $fillable = ['nama_product', 'deskripsi', 'hpp', 'margin', 'price'];
    public function dealDetails()
    {
        return $this->hasMany(DealDetail::class);
    }
    
}
