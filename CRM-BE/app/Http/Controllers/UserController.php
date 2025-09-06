<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Support\Facades\Hash;


class UserController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        return response() ->json([
            'success' => true,
            'message' => 'List Data User',
            'data'    => User::all()
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {

        $messages = [
        'name.required'     => 'Nama wajib diisi.',
        'nip.required'      => 'NIP wajib diisi.',
        'nip.unique'        => 'NIP sudah digunakan, gunakan NIP lain.',
        'password.required' => 'Password wajib diisi.',
        'password.min'      => 'Password minimal 6 karakter.',
        'password.regex'    => 'Password harus mengandung minimal satu angka.',
        'role.required'     => 'Role wajib diisi.',
        'role.in'           => 'Role hanya boleh: manager atau sales.',
    ];
    $request->validate([
        'name'     => 'required|string',
        'nip'      => 'required|string|unique:users,nip',
        'password' => [
            'required',
            'string',
            'min:6',
            'regex:/[0-9]/'
        ],
        'role'     => 'required|string|in:manager,sales',
    ] , $messages);
        $user = User::create([
            'name' => $request->name,
            'nip' => $request->nip,
            'password' => Hash::make($request->password),
            'role' => $request->role,
        ]);
        return response()->json([
            'message' => 'User created successfully',
            'user' => $user   
        ]) ->setStatusCode(201);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $user = User::find($id);
        if (!$user) {
            return response()->json([
                'message' => 'User not found'
            ], 404);
        }
        return response()->json([
            'message' => 'User retrieved successfully',
            'user' => $user
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $user = User::find($id);
        if (!$user) {
            return response()->json([
                'message' => 'User not found'
            ], 404);
        }

            $messages = [
            'name.required'     => 'Nama wajib diisi.',
            'nip.required'      => 'NIP wajib diisi.',
            'nip.unique'        => 'NIP sudah digunakan oleh user lain.',
            'password.required' => 'Password wajib diisi.',
            'password.min'      => 'Password minimal 6 karakter.',
            'password.regex'    => 'Password harus mengandung minimal satu angka.',
            'role.required'     => 'Role wajib diisi.',
            'role.in'           => 'Role hanya boleh: manager atau sales.',
        ];
        $request->validate([
            'name' => 'sometimes|required|string',
            'nip' => 'sometimes|required|string|unique:users,nip,' . $user->id,
            'password' => [
                'sometimes',
                'required',
                'string',
                'min:6',
                'regex:/[0-9]/'
            ],
            'role' => 'sometimes|required|string|in:manager,sales', 
        ] , $messages);
        if ($request->has('name')) {
            $user->name = $request->name;
        }
        if ($request->has('nip')) {
            $user->nip = $request->nip;
        }
        if ($request->has('password')) {
            $user->password = Hash::make($request->password);
        }
        if ($request->has('role')) {
            $user->role = $request->role;
        }
        $user->save();
        return response()->json([
            'message' => 'User updated successfully',
            'user' => $user
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $user = User::find($id);
        if (!$user) {
            return response()->json([
                'message' => 'User not found'
            ], 404);
        }
        $user->delete();
        return response()->json([
            'message' => 'User deleted successfully'
        ]);
    }
}
