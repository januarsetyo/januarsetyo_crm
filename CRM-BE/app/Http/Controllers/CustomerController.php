<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Customer;
use Illuminate\Support\Facades\Auth;

class CustomerController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $user = Auth::user();

        $query = Customer::with([
            'lead',                         
            'deals.dealDetails.product'     
        ])->where('is_active', true);

        if ($user->role === 'sales') {
            $query->whereHas('deals', function ($q) use ($user) {
                $q->where('user_id', $user->id);
            });
        }

        $customers = $query->get();

        return response()->json([
            'success' => true,
            'data' => $customers
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        //
    }

    /**
     * Display the specified resource.
     */
    public function show($id)
    {
        $user = Auth::user();

        $customer = Customer::with([
            'lead',
            'deals.dealDetails.product'
        ])->where('is_active', true)->findOrFail($id);

        if ($user->role === 'sales') {
            $owned = $customer->deals()->where('user_id', $user->id)->exists();
            if (!$owned) {
                return response()->json(['error' => 'Forbidden'], 403);
            }
        }

        return response()->json([
            'success' => true,
            'data' => $customer
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        //
    }
}
