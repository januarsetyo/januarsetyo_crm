<?php

namespace App\Http\Controllers;


use App\Models\DealDetail;
use Illuminate\Http\Request;
use Maatwebsite\Excel\Facades\Excel;
use App\Exports\DealReportExport;
class ReportController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        //
    }
        public function exportDealsReport(Request $request)
    {
        $start = $request->query('start_date');
        $end   = $request->query('end_date');

        // Ambil deal detail + relasi
        $query = DealDetail::with([
            'deal.lead',       // untuk nama, nik, kontak, alamat
            'deal.customer',   // jika sudah jadi customer
            'deal.user',       // sales
            'product'          // produk
        ])->whereHas('deal', function ($q) {
            $q->where('status', 'approved'); // filter hanya deal approved
        });

        if ($start && $end) {
            $query->whereBetween('created_at', [
                $start . " 00:00:00",
                $end . " 23:59:59"
            ]);
        }

        $dealDetails = $query->get();

        return Excel::download(new DealReportExport($dealDetails), 'hasil-laporan.xlsx');
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
