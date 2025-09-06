<?php
use Illuminate\Http\Request;  
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\LeadController;
use App\Http\Controllers\CustomerController;
use App\Http\Controllers\DealController;
use App\Http\Controllers\DealDetailController;
use App\Http\Controllers\ReportController;

Route::post('/login', [AuthController::class, 'login']);
Route::post('/logout', [AuthController::class, 'logout']);
Route::get('/me', [AuthController::class, 'me']);

    
Route::middleware(['auth:api', 'role:manager'])->group(function () {
        Route::apiResource('user', UserController::class);
        Route::post('/deals/{id}/approve', [DealController::class, 'approve']);     
    });

Route::middleware(['auth:api', 'role:sales'])->group(function () {
        Route::apiResource(('product'), ProductController::class);
        Route::post('/lead', [LeadController::class, 'store']);
        Route::put('/lead/{id}', [LeadController::class, 'update']);
        Route::delete('/lead/{id}', [LeadController::class, 'destroy']);
        Route::apiResource(('customer'), CustomerController::class);
        Route::post('/deals', [DealController::class, 'store']);
        Route::post('/deals/{deal}/details', [DealDetailController::class, 'store']);
        Route::get('/deals', [DealController::class, 'index']);
});

Route::middleware(['auth:api', 'role:manager,sales'])->group(function () {
        Route::get('/lead', [LeadController::class, 'index']);
        Route::get('/lead/{id}', [LeadController::class, 'show']);
        Route::get('/product', [ProductController::class, 'index']);
        Route::get('/deals', [DealController::class, 'index']);
        Route::get('/customers', [CustomerController::class, 'index']);
        Route::get('/customers/{id}', [CustomerController::class, 'show']);
        Route::get('/reports/deals', [ReportController::class, 'dealsReport']);
        Route::get('/reports/deals/export', [ReportController::class, 'exportDealsReport']);


});



