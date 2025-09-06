<?php

namespace App\Http\Controllers;

use App\Models\Product;
use Illuminate\Http\Request;

class ProductController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        return response() ->json([
            'success' => true,
            'message' => 'List Data Product',
            'data'    => Product::all()
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
            $messages = [
                'nama_product.required' => 'Nama Product wajib diisi.',
                'deskripsi.required'    => 'Deskripsi wajib diisi.',
                'hpp.required'          => 'HPP wajib diisi.',
                'hpp.integer'           => 'HPP harus berupa angka.',
                'margin.required'       => 'Margin wajib diisi.',
                'margin.integer'        => 'Margin harus berupa angka.',
            ];
        $request->validate([
            'nama_product' => 'required |string',
            'deskripsi'    => 'required |string',
            'hpp'          => 'required |numeric |min:0',
            'margin'       => 'required |numeric |min:0|max:100',
        ] , $messages);

        $price = $request->hpp + ($request->hpp * $request->margin / 100);

        $product = Product::create([
            'nama_product' => $request->nama_product,
            'deskripsi'    => $request->deskripsi,
            'hpp'          => $request->hpp,
            'margin'       => $request->margin,
            'price'        => $price,
        ]);
        return response()->json([
            'message' => 'Product created successfully',
            'product' => $product   
        ]) ->setStatusCode(201);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $product = Product::find($id);
        if (!$product) {
            return response()->json([
                'success' => false,
                'message' => 'Product not found',
            ], 404);
        }
        return response()->json([
            'success' => true,
            'message' => 'Detail Data Product',
            'data'    => $product
        ], 200);
    }

    /**
     * Update the specified resource in storage.
     */
public function update(Request $request, $id)
{
    $product = Product::findOrFail($id);

    $messages = [
        'nama_product.required' => 'Nama Product wajib diisi.',
        'deskripsi.required'    => 'Deskripsi wajib diisi.',
        'hpp.required'          => 'HPP wajib diisi.',
        'hpp.numeric'           => 'HPP harus berupa angka.',
        'margin.required'       => 'Margin wajib diisi.',
        'margin.numeric'        => 'Margin harus berupa angka.',
    ];

    $data = $request->validate([
        'nama_product' => 'sometimes|required|string',
        'deskripsi'    => 'sometimes|required|string',
        'hpp'          => 'sometimes|required|numeric',
        'margin'       => 'sometimes|required|numeric',
    ], $messages);

    if (isset($data['hpp']) || isset($data['margin'])) {
        $hpp    = $data['hpp']    ?? $product->hpp;
        $margin = $data['margin'] ?? $product->margin;
        $data['price'] = $hpp + ($hpp * $margin / 100);
    }

    $product->update($data);

    return response()->json([
        'message' => 'Product updated successfully',
        'product' => $product
    ], 200);
}


    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $product = Product::find($id);
        if (!$product) {
            return response()->json([
                'message' => 'Product not found'
            ], 404);
        }
        $product->delete();
        return response()->json([
            'message' => 'Product deleted successfully'
        ], 200);
    }
}
