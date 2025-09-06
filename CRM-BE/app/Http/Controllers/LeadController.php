<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Lead;

class LeadController extends Controller
{
    /**
     * Display a listing of the resource.
     */
public function index(Request $request)
{
    $user = $request->user();

    if ($user->role === 'sales') {
        $leads = Lead::with('customer')
            ->where('user_id', $user->id)
            ->get();
    } elseif ($user->role === 'manager') {
        $leads = Lead::with(['customer', 'user'])->get();
    } else {
        return response()->json([
            'success' => false,
            'message' => 'Forbidden',
        ], 403);
    }

    return response()->json([
        'success' => true,
        'message' => 'List Data Lead',
        'data'    => $leads
    ], 200);
}


    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $messages = [
            'nik.required'     => 'NIK wajib diisi.',
            'nik.integer'      => 'NIK harus berupa angka.',
            'nik.unique'       => 'NIK sudah digunakan, gunakan NIK lain.',
            'nama.required'    => 'Nama wajib diisi.',
            'contact.required' => 'Contact wajib diisi.',
            'kebutuhan.required' => 'Kebutuhan wajib diisi.',
            'alamat.required'  => 'Alamat wajib diisi.',
        ];
        $request->validate([
            'nik'     => 'required|integer|unique:leads,nik',
            'nama'    => 'required|string',
            'contact' => 'required|string',
            'alamat'  => 'required|string',
            'kebutuhan' => 'required|string',
        ] , $messages);

        $lead = Lead::create([
            'user_id' => $request->user()->id,
            'nik'     => $request->nik,
            'nama'    => $request->nama,
            'contact' => $request->contact,
            'alamat'  => $request->alamat,
            'kebutuhan' => $request->kebutuhan,
        ]);
        return response()->json([
            'message' => 'Lead created successfully',
            'lead'    => $lead   
        ]) ->setStatusCode(201);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $lead = Lead::with('customer')->find($id);
        if (!$lead) {
            return response()->json([
                'success' => false,
                'message' => 'Lead not found',
            ], 404);
        }
        return response()->json([
            'success' => true,
            'message' => 'Detail Data Lead',
            'data'    => $lead
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, $id)
    {
        $lead = Lead::find($id);
        if (!$lead) {
            return response()->json([
                'message' => 'Lead not found'
            ], 404);
        }

        $messages = [
            'nik.integer'      => 'NIK harus berupa angka.',
            'nik.unique'       => 'NIK sudah digunakan, gunakan NIK lain.',
            'nama.string'      => 'Nama harus berupa string.',
            'contact.string'   => 'Contact harus berupa string.',
            'alamat.string'    => 'Alamat harus berupa string.',
            'kebutuhan.string' => 'Kebutuhan harus berupa string.',
        ];
        $request->validate([
            'nik'     => 'sometimes|integer|unique:leads,nik,' . $lead->id,
            'nama'    => 'sometimes|string',
            'contact' => 'sometimes|string',
            'alamat'  => 'sometimes|string',
            'kebutuhan' => 'sometimes|string',
        ] , $messages);

        $lead->user_id = $request->user()->id;

        if ($request->has('nik')) {
            $lead->nik = $request->nik;
        }
        if ($request->has('nama')) {
            $lead->nama = $request->nama;
        }
        if ($request->has('contact')) {
            $lead->contact = $request->contact;
        }
        if ($request->has('alamat')) {
            $lead->alamat = $request->alamat;
        }
        if ($request->has('kebutuhan')) {
            $lead->kebutuhan = $request->kebutuhan;
        }
        $lead->save();

        return response()->json([
            'message' => 'Lead updated successfully',
            'lead'    => $lead
        ], 200);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $lead = Lead::find($id);
        if (!$lead) {
            return response()->json([
                'message' => 'Lead not found'
            ], 404);
        }
        $lead->delete();
        return response()->json([
            'message' => 'Lead deleted successfully'
        ], 200);
    }
}
