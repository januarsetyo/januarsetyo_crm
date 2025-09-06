<?php

namespace App\Http\Controllers;

use App\Models\Deal;
use App\Models\Lead;
use App\Models\Customer;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class DealController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $user = Auth::user();

        if ($user->role === 'manager') {
            $deals = Deal::with('lead', 'customer', 'dealDetails.product', 'user')->get();
        } else {
            $deals = Deal::with('lead', 'customer', 'dealDetails.product', 'user')
                         ->where('user_id', $user->id)
                         ->get();
        }

        return response()->json([
            'success' => true,
            'data' => $deals
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'lead_id' => 'required|exists:leads,id'
        ]);

        $deal = Deal::create([
            'lead_id' => $request->lead_id,
            'user_id' => Auth::id(),
            'status'  => 'pending'
        ]);

        return response()->json([
            'message' => 'Deal created',
            'deal' => $deal
        ], 201);
    }

        public function approve(Request $request, $id)
    {
        $user = Auth::user();
        if ($user->role !== 'manager') {
            return response()->json(['error' => 'Forbidden'], 403);
        }

        $request->validate([
            'status' => 'required|in:approved,rejected'
        ]);

        $deal = Deal::findOrFail($id);
        $deal->status = $request->status;
        $deal->approved_by = $user->id;
        $deal->approved_at = now();
        $deal->save();

        if ($request->status === 'approved' && !$deal->customer_id) {
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
            $deal->save();
        }

        return response()->json([
            'message' => "Deal {$request->status}",
            'deal' => $deal
        ]);
    }

    /**
     * Display the specified resource.
     */
    public function show($id)
    {
        $user = Auth::user();
        $deal = Deal::with('lead', 'customer', 'dealDetails.product', 'user')->findOrFail($id);

        if ($user->role === 'sales' && $deal->user_id !== $user->id) {
            return response()->json(['error' => 'Forbidden'], 403);
        }

        return response()->json([
            'success' => true,
            'data' => $deal
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
