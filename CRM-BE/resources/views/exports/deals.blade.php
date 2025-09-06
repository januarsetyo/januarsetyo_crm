<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Rekap Laporan</title>
</head>
<body>
<table>
    <thead>
        <tr>
            <th>Nama Customer</th>
            <th>NIK</th>
            <th>Kontak</th>
            <th>Alamat</th>
            <th>Nama Sales</th>
            <th>Produk</th>
            <th>Status</th>
            <th>Harga</th>
            <th>Qty</th>
            <th>Total</th>
        </tr>
    </thead>
    <tbody>
        @foreach($dealDetails as $detail)
            <tr>
                <td>{{ $detail->deal->lead->nama ?? '-' }}</td>
                <td>{{ $detail->deal->lead->nik ?? '-' }}</td>
                <td>{{ $detail->deal->lead->contact ?? '-' }}</td>
                <td>{{ $detail->deal->lead->alamat ?? '-' }}</td>
                <td>{{ $detail->deal->user->name ?? '-' }}</td>
                <td>{{ $detail->product->nama_product ?? '-' }}</td>
                <td>{{ $detail->deal->status ?? '-' }}</td>
                <td>
                    Rp {{ number_format($detail->negotiated_price ?? 0, 0, ',', '.') }}
                </td>
                <td>{{ $detail->quantity ?? 0 }}</td>
                <td>
                    Rp {{ number_format(($detail->negotiated_price ?? 0) * ($detail->quantity ?? 0), 0, ',', '.') }}
                </td>
            </tr>
        @endforeach
    </tbody>
</table>
</body>
</html>
