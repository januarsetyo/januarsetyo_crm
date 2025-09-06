<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Lead extends Model
{
    protected $table = 'leads';
    protected $fillable = ['user_id', 'nik','nama', 'contact', 'alamat', 'kebutuhan', 'status'];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function customer()
    {
        return $this->hasOne(Customer::class);
    }

    public function deals()
    {
        return $this->hasMany(Deal::class);
    }
}
