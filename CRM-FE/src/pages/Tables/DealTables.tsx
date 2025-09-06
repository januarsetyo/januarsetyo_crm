import { useEffect, useState } from "react";
import axios from "axios";
import fileDownload from "js-file-download";
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
import Badge from "../../components/ui/badge/Badge";
import Alert from "../../components/ui/alert/Alert";
import { Modal } from "../../components/ui/modal";

interface DealDetail {
  id: number;
  product: {
    id: number;
    nama_product: string;
  };
  quantity: number;
  negotiated_price: number;
}

interface Deal {
  id: number;
  user: {
    id: number;
    name: string;
  };
  lead: {
    id: number;
    nama: string;
    kebutuhan: string;
  };
  status: string;
  deal_details: DealDetail[];
  created_at: string;
}

export default function DealTable() {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [userRole, setUserRole] = useState<string>("");
  const [sorting, setSorting] = useState<SortingState>([]);
  const [alert, setAlert] = useState<{
    variant: "success" | "error";
    title: string;
    message: string;
  } | null>(null);

  // modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [step, setStep] = useState(1);
  const [newDealId, setNewDealId] = useState<number | null>(null);

  const [leads, setLeads] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [selectedLead, setSelectedLead] = useState<any>(null);

  const [UserId, setUserId] = useState("");
  const [leadId, setLeadId] = useState("");
  const [productId, setProductId] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [negoPrice, setNegoPrice] = useState(0);

  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
    const [reportStart, setReportStart] = useState("");
    const [reportEnd, setReportEnd] = useState("");


  const showAlert = (
    variant: "success" | "error",
    title: string,
    message: string
  ) => {
    setAlert({ variant, title, message });
    setTimeout(() => setAlert(null), 4000);
  };

  const fetchUserRole = () => {
    fetch("http://127.0.0.1:8000/api/me", {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    })
      .then((res) => res.json())
      .then((res) => setUserRole(res.role || ""))
      .catch(console.error);
  };

  const fetchDeals = () => {
    fetch("http://127.0.0.1:8000/api/deals", {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    })
      .then((res) => res.json())
      .then((res) => {
        if (res.success) setDeals(res.data);
      })
      .catch(console.error);
  };

  const fetchLeads = () => {
    fetch("http://127.0.0.1:8000/api/lead", {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    })
      .then((res) => res.json())
      .then((res) => setLeads(res.data || []));
  };

  const fetchUsers = () => {
    fetch("http://127.0.0.1:8000/api/user", {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    })
      .then((res) => res.json())
      .then((res) => setUsers(res.data || []));
  };

  const fetchProducts = () => {
    fetch("http://127.0.0.1:8000/api/product", {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    })
      .then((res) => res.json())
      .then((res) => setProducts(res.data || []));
  };

  useEffect(() => {
    fetchUserRole();
    fetchLeads();
    fetchProducts();
  }, []);

  useEffect(() => {
    if (userRole) fetchDeals();
  }, [userRole]);

  const handleApprove = (id: number, status: "approved" | "rejected") => {
    fetch(`http://127.0.0.1:8000/api/deals/${id}/approve`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify({ status }),
    })
      .then((res) => res.json())
      .then((res) => {
        showAlert("success", "Success", res.message || "Status updated");
        fetchDeals();
      })
      .catch((err) => {
        showAlert("error", "Error", err.message || "Failed update");
      });
  };

  const formatRupiah = (value: number) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(value);

  const handleCreateDeal = async () => {
    const res = await fetch("http://127.0.0.1:8000/api/deals", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify({ lead_id: leadId }),
    });
    const data = await res.json();
    if (res.ok) {
      setNewDealId(data.deal.id);
      setStep(2);
    } else {
      showAlert("error", "Error", data.message || "Failed create deal");
    }
  };

  const handleAddDetail = async () => {
    if (!newDealId) return;
    const res = await fetch(
      `http://127.0.0.1:8000/api/deals/${newDealId}/details`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          product_id: productId,
          quantity,
          negotiated_price: negoPrice,
        }),
      }
    );
    const data = await res.json();
    if (res.ok) {
      showAlert("success", "Success", "Deal detail added");
      setIsModalOpen(false);
      setStep(1);
      setNewDealId(null);
      setLeadId("");
      setProductId("");
      setQuantity(1);
      setNegoPrice(0);
      fetchDeals();
    } else {
      showAlert("error", "Error", data.message || "Failed add detail");
    }
  };

    const handleContinueStep2 = (deal: Deal) => {
    setNewDealId(deal.id);
    setLeadId(deal.lead.id.toString());
    setSelectedLead(deal.lead);
    setStep(2);
    setIsModalOpen(true);
  };


    const handleDownloadReport = async () => {
  try {
    const url = new URL("http://127.0.0.1:8000/api/reports/deals/export");
    if (reportStart && reportEnd) {
      url.searchParams.append("start_date", reportStart);
      url.searchParams.append("end_date", reportEnd);
    }

    const res = await axios.get(url.toString(), {
      responseType: "blob",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });

    fileDownload(res.data, "laporan-deal.xlsx");
  } catch (error) {
    console.error("Download gagal:", error);
  }
};

  const columns: ColumnDef<Deal>[] = [
    { accessorKey: "id", header: "ID" },
    {
      accessorKey: "lead.nama",
      header: "Nama Lead",
      cell: ({ row }) => row.original.lead?.nama || "-",
    },
    {
        accessorKey: "user.name",
        header: "Sales",
        cell: ({ row }) => row.original.user?.name || "-",
    },
    {
      accessorKey: "deal_details",
      header: "Nama Produk",
      cell: ({ row }) => (
        <div className="flex flex-col gap-1 text-left">
          {row.original.deal_details.map((d) => (
            <span key={d.id}>{d.product?.nama_product}</span>
          ))}
        </div>
      ),
    },
    {
      header: "Quantity",
      cell: ({ row }) => (
        <div className="flex flex-col gap-1 text-center">
          {row.original.deal_details.map((d) => (
            <span key={d.id}>{d.quantity}</span>
          ))}
        </div>
      ),
    },
    {
      header: "Harga Nego",
      cell: ({ row }) => (
        <div className="flex flex-col gap-1 text-right">
          {row.original.deal_details.map((d) => (
            <span key={d.id}>{formatRupiah(d.negotiated_price)}</span>
          ))}
        </div>
      ),
    },
    {
      header: "Total Harga",
      cell: ({ row }) => (
        <div className="flex flex-col gap-1 text-right">
          {row.original.deal_details.map((d) => (
            <span key={d.id}>
              {formatRupiah(d.quantity * d.negotiated_price)}
            </span>
          ))}
        </div>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.original.status;
        return status === "approved" ? (
        <span class="inline-flex items-center px-2.5 py-0.5 justify-center gap-1 rounded-full font-medium text-sm bg-success-50 text-success-600 dark:bg-success-500/15 dark:text-success-500">Approved</span>
        ) : status === "pending" ? (
        <span class="inline-flex items-center px-2.5 py-0.5 justify-center gap-1 rounded-full font-medium text-sm bg-error-50 text-warning-600 dark:bg-warning-500/15 dark:text-warning-500">Pending</span>
        ) : status === "rejected" ? (
        <span class="inline-flex items-center px-2.5 py-0.5 justify-center gap-1 rounded-full font-medium text-sm bg-error-50 text-error-600 dark:bg-error-500/15 dark:text-error-500">Rejected</span>
        ) : (
          <Badge>{status}</Badge>
        );
      },
    },
    {
      id: "actions",
      header: "Action",
      cell: ({ row }) => {
        const hasDetails = row.original.deal_details.length > 0;
        return (
          <div className="flex justify-center gap-2">
            {userRole === "sales" && (
              <Button
                size="sm"
                onClick={() => handleContinueStep2(row.original)}
                disabled={hasDetails}
              >
                {hasDetails ? "Selesai" : "Lengkapi Detail"}
              </Button>
            )}
            {userRole === "manager" && (
              <>
                <Button
                  size="sm"
                  onClick={() => handleApprove(row.original.id, "approved")}
                  disabled={row.original.status === "approved"}
                >
                  Approve
                </Button>
                <Button
                  size="sm"
                  onClick={() => handleApprove(row.original.id, "rejected")}
                  disabled={row.original.status === "approved"}
                >
                  Reject
                </Button>
              </>
            )}
          </div>
        );
      },
    },
  ];

  const table = useReactTable({
    data: deals,
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

        <div className="flex items-center gap-3 mb-4">
        {userRole === "sales" && (
            <Button onClick={() => setIsModalOpen(true)}>
            Tambah Deal
            </Button>
        )}
        <Button onClick={() => setIsReportModalOpen(true)}>
            Cetak Laporan
        </Button>
        </div>


      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
        <div className="max-w-full overflow-x-auto">
          <Table>
            <TableHeader className="border-b border-gray-100">
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableCell
                      key={header.id}
                      isHeader
                      className="text-center align-middle cursor-pointer select-none"
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

      {/* Modal Tambah Deal */}
<Modal
  isOpen={isModalOpen}
  onClose={() => {
    setIsModalOpen(false);
    setStep(1);
    setNewDealId(null);
    setLeadId("");
    setProductId("");
    setQuantity(1);
    setNegoPrice(0);
  }}
  className="max-w-[500px] m-4"
>
  <div className="p-6 bg-white dark:bg-gray-900 rounded-2xl">
    <h4 className="text-lg font-semibold mb-4">Tambah Deal</h4>

    {step === 1 ? (
      <div className="grid grid-cols-1 gap-4">
        <div>
          <label className="block mb-1">Lead</label>
          <select
            value={leadId}
            onChange={(e) => setLeadId(e.target.value)}
            className="border rounded p-2 w-full"
          >
            <option value="">-- Pilih Lead --</option>
            {leads.map((l) => (
              <option key={l.id} value={l.id}>
                {l.nama}
              </option>
            ))}
          </select>
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <Button
            variant="outline"
            onClick={() => {
              setIsModalOpen(false);
              setLeadId("");
            }}
          >
            Close
          </Button>
          <Button onClick={handleCreateDeal} disabled={!leadId}>
            Next
          </Button>
        </div>
      </div>
    ) : (
      <div className="grid grid-cols-1 gap-4">

        <div>
        <label className="block mb-1">Kebutuhan</label>
        <input
          type="text"
          value={selectedLead.kebutuhan || "-"}
          disabled
          className="border rounded p-2 w-full bg-gray-100"
        />
      </div>
        <div>
          <label className="block mb-1">Produk</label>
          <select
            value={productId}
            onChange={(e) => setProductId(e.target.value)}
            className="border rounded p-2 w-full"
          >
            <option value="">-- Pilih Produk --</option>
            {products.map((p) => (
              <option key={p.id} value={p.id}>
                {p.nama_product}
              </option>
            ))}
          </select>
        </div>

        <div>
        <label className="block mb-1">Harga Produk</label>
        <input
          type="text"
          value={formatRupiah(
            products.find((p) => p.id === Number(productId))?.price || 0
          )}
          disabled
          className="border rounded p-2 w-full bg-gray-100"
        />
      </div>

        <div>
          <label className="block mb-1">Quantity</label>
          <input
            type="number"
            min={1}
            value={quantity}
            onChange={(e) => setQuantity(Number(e.target.value))}
            className="border rounded p-2 w-full"
          />
        </div>

        <div>
          <label className="block mb-1">Harga dari customer</label>
          <input
            type="number"
            min={0}
            value={negoPrice}
            onChange={(e) => setNegoPrice(Number(e.target.value))}
            className="border rounded p-2 w-full"
          />
        </div>

        <div>
          <label className="block mb-1">Total Price</label>
          <input
            type="text"
            value={formatRupiah(quantity * negoPrice)}
            disabled
            className="border rounded p-2 w-full"
          />
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <Button
            variant="outline"
            onClick={() => {
              setIsModalOpen(false);
              setStep(1);
              setNewDealId(null);
              setLeadId("");
              setProductId("");
              setQuantity(1);
              setNegoPrice(0);
            }}
          >
            Close
          </Button>
          <Button onClick={handleAddDetail} disabled={!productId || quantity < 1}>
            Save
          </Button>
        </div>
      </div>
    )}
  </div>
</Modal>

<Modal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        className="max-w-[400px] m-4"
      >
        <div className="p-6 bg-white dark:bg-gray-900 rounded-2xl">
          <h4 className="text-lg font-semibold mb-4">Cetak Laporan</h4>

          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block mb-1">Tanggal Mulai</label>
              <input
                type="date"
                value={reportStart}
                onChange={(e) => setReportStart(e.target.value)}
                className="border rounded p-2 w-full"
              />
            </div>
            <div>
              <label className="block mb-1">Tanggal Selesai</label>
              <input
                type="date"
                value={reportEnd}
                onChange={(e) => setReportEnd(e.target.value)}
                className="border rounded p-2 w-full"
              />
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setIsReportModalOpen(false)}
              >
                Close
              </Button>
              <Button onClick={handleDownloadReport}>Download Excel</Button>
            </div>
          </div>
        </div>
      </Modal>


    </div>
  );
}
