<?php

namespace App\Http\Controllers;

use App\Models\Deal;
use App\Models\DealDetail;
use App\Models\Product;
use App\Models\Customer;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class DealDetailController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request, $dealId)
    {
        $request->validate([
            'product_id' => 'required|exists:product,id',
            'quantity' => 'required|integer|min:1',
            'negotiated_price' => 'required|numeric|min:0'
        ]);

        $deal = Deal::findOrFail($dealId);

        if (Auth::user()->role === 'sales' && $deal->user_id !== Auth::id()) {
            return response()->json(['error' => 'Forbidden'], 403);
        }

        $product = Product::findOrFail($request->product_id);

        $detail = DealDetail::create([
            'deal_id' => $deal->id,
            'product_id' => $product->id,
            'quantity' => $request->quantity,
            'negotiated_price' => $request->negotiated_price
        ]);

        if ($request->negotiated_price >= $product->price) {
            $deal->status = 'approved';

            if (!$deal->customer_id) {
                $lead = $deal->lead;
                $customer = Customer::create([
                    'lead_id' => $lead->id,
                    'name' => $lead->name,
                    'contact' => $lead->contact,
                    'address' => $lead->address,
                    'is_active' => true
                ]);

                $lead->status = 'converted';
                $lead->save();

                $deal->customer_id = $customer->id;
            }

            $deal->save();
        }

        return response()->json([
            'message' => 'Deal detail added',
            'deal' => $deal->load('dealDetails.product')
        ]);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        //
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
