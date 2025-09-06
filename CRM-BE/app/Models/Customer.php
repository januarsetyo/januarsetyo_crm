<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;


class Customer extends Model
{
    protected $table = 'customer';
    protected $fillable = [ 'lead_id', 'is_active'];
    public function lead()
    {
        return $this->belongsTo(Lead::class);
    }
    public function deals()
    {
        return $this->hasMany(Deal::class);
    }
    
}
