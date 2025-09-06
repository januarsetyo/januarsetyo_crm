<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class DealDetail extends Model
{
    protected $table = 'deals_detail';
    protected $fillable = ['deal_id', 'product_id', 'quantity', 'negotiated_price'];

    public function deal()
    {
        return $this->belongsTo(Deal::class);
    }

    public function product()
    {
        return $this->belongsTo(Product::class);
    }
    
}
