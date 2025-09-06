<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
     public function login(Request $request)
    {
        $request->validate([
            'name'     => 'required|string',
            'nip'     => 'required|string',
            'password' => 'required|string',
        ]);

        $credentials = $request->only('name', 'nip', 'password');

        if (! $token = Auth::guard('api')->attempt($credentials)) {
            return response()->json(['error' => 'Nama, NIP, atau password salah'], 401);
        }

        return $this->respondWithToken($token);
    }

    protected function respondWithToken($token)
    {
        return response()->json([
            'access_token' => $token,
            'token_type'   => 'bearer',
            'expires_in'   => config('jwt.ttl') * 60,
            'user'         => Auth::guard('api')->user(),
        ]);
    }

    public function logout()
    {
        Auth::guard('api')->logout();

        return response()->json(['message' => 'Berhasil logout']);
    }

    public function me()
    {
        return response()->json(Auth::guard('api')->user());
    }
}
