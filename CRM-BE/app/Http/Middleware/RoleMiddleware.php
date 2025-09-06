<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class RoleMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next , ...$role): Response
    {
        $user = $request->user();

        if (!$user) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        if (!in_array($user->role, $role)) {
            return response()->json([
                'error' => 'Forbidden',
                'your_role' => $user->role,
                'allowed' => $role,
                    'route' => $request->path(),
    'method' => $request->method(),
            ], 403);
        }
        

        return $next($request);
    }
}
