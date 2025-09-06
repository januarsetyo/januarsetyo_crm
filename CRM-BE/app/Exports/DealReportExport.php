<?php

namespace App\Exports;

use Illuminate\Contracts\View\View;
use Maatwebsite\Excel\Concerns\FromView;

class DealReportExport implements FromView
{
    protected $dealDetails;

    public function __construct($dealDetails)
    {
        $this->dealDetails = $dealDetails;
    }

    public function view(): View
    {
        return view('exports.deals', [
            'dealDetails' => $this->dealDetails
        ]);
    }
}
