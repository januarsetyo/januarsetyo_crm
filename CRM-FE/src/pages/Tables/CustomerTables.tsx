import { useEffect, useState } from "react";
import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  SortingState,
  ColumnDef,
  useReactTable,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import Button from "../../components/ui/button/Button";
import Alert from "../../components/ui/alert/Alert";

interface CustomerType {
  id: number;
  lead_id: number;
  is_active: number;
  lead?: {
    nama: string;
    contact: string;
    alamat: string;
  };
  deals?: {
    id: number;
    deal_details?: {
      id: number;
      product?: {
        id: number;
        nama_product: string;
      };
    }[];
  }[];
}

export default function CustomerTable() {
  const API_BASE = import.meta.env.VITE_API_BASE_URL;
  const [customers, setCustomers] = useState<CustomerType[]>([]);
  const [alert, setAlert] = useState<{
    variant: "success" | "error";
    title: string;
    message: string;
  } | null>(null);
  const [userRole, setUserRole] = useState<string>("");

  const [sorting, setSorting] = useState<SortingState>([]);

  const showAlert = (
    variant: "success" | "error",
    title: string,
    message: string
  ) => {
    setAlert({ variant, title, message });
    setTimeout(() => setAlert(null), 4000);
  };

  const fetchCustomers = () => {
    const url =
      userRole === "manager"
        ? `${API_BASE}/customers`
        : `${API_BASE}/customers`;

    fetch(url, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    })
      .then((res) => res.json())
      .then((res) => {
        if (res.success) setCustomers(res.data);
        else if (res.data) setCustomers(res.data); // fallback
      })
      .catch((err) => {
        console.error(err);
        showAlert("error", "Error", "Gagal memuat data customer");
      });
  };

  const fetchUserRole = () => {
    fetch(`${API_BASE}/me`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    })
      .then((res) => res.json())
      .then((res) => {
        setUserRole(res.role || "");
      })
      .catch(console.error);
  };

  useEffect(() => {
    fetchUserRole();
  }, []);

  useEffect(() => {
    if (userRole) {
      fetchCustomers();
    }
  }, [userRole]);

  const columns: ColumnDef<CustomerType>[] = [
    { accessorKey: "id", header: "ID" },
    {
      header: "Nama",
      cell: ({ row }) => row.original.lead?.nama ?? "-",
    },
    {
      header: "Contact",
      cell: ({ row }) => row.original.lead?.contact ?? "-",
    },
    {
      header: "Alamat",
      cell: ({ row }) => row.original.lead?.alamat ?? "-",
    },
    {
      header: "Layanan Produk",
      cell: ({ row }) => {
        const produkList =
          row.original.deals?.flatMap(
            (deal) =>
              deal.deal_details?.map(
                (d) => d.product?.nama_product ?? "-"
              ) ?? []
          ) ?? [];

        return produkList.length > 0 ? produkList.join(", ") : "-";
      },
    },
    {
    header: "Status",
    cell: ({ row }) =>
      row.original.is_active === 1 ? (
        <span className="inline-flex items-center px-2.5 py-0.5 justify-center gap-1 rounded-full font-medium text-sm bg-success-50 text-success-600 dark:bg-success-500/15 dark:text-success-500">Aktif</span>
      ) : (
        <span className="inline-flex items-center px-2.5 py-0.5 justify-center gap-1 rounded-full font-medium text-sm bg-error-50 text-error-600 dark:bg-error-500/15 dark:text-error-500">Nonaktif</span>
      ),
  },
  ];

  const table = useReactTable({
    data: customers,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  return (
    <div>
      {alert && (
        <div className="mb-4">
          <Alert
            variant={alert.variant}
            title={alert.title}
            message={alert.message}
          />
        </div>
      )}

      {/* Table */}
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
      <div className="max-w-full overflow-x-auto">
        {customers.length === 0 ? (
          <div className="py-6 text-center text-gray-500 font-medium">
            Data tidak ada
          </div>
        ) : (
          <Table>
            <TableHeader className="border-b border-gray-100">
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableCell
                      key={header.id}
                      isHeader
                      className="text-center align-middle"
                    >
                      <div
                        className="cursor-pointer select-none"
                        onClick={header.column.getToggleSortingHandler()}
                      >
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                        {header.column.getIsSorted() === "asc"
                          ? " 🔼"
                          : header.column.getIsSorted() === "desc"
                          ? " 🔽"
                          : null}
                      </div>
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      className="text-center align-middle"
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </div>

      {/* Pagination */}
      <div className="flex items-center justify-between mt-4">
        <div className="flex items-center gap-2">
          <span>Show</span>
          <select
            value={table.getState().pagination.pageSize}
            onChange={(e) => table.setPageSize(Number(e.target.value))}
            className="border rounded px-2 py-1"
          >
            {[10, 50, 100].map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
          <span>entries</span>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Prev
          </Button>
          <span>
            Page {table.getState().pagination.pageIndex + 1} of{" "}
            {table.getPageCount()}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
