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
import Label from "../../components/form/Label";
import Input from "../../components/form/input/InputField";
import Button from "../../components/ui/button/Button";
import { Modal } from "../../components/ui/modal";
import { useModal } from "../../hooks/useModal";
import Alert from "../../components/ui/alert/Alert";

interface LeadType {
  id: number;
  nik: string;
  nama: string;
  contact: string;
  alamat: string;
  kebutuhan: string;
  status?: string;
}

export default function LeadTable() {
  const API_BASE = import.meta.env.VITE_API_BASE_URL;
  const [leads, setLeads] = useState<LeadType[]>([]);
  const [selectedLead, setSelectedLead] = useState<LeadType | null>(null);
  const [formData, setFormData] = useState<{
    nik: string;
    nama: string;
    contact: string;
    alamat: string;
    kebutuhan: string;
    status: string;
  }>({
    nik: "",
    nama: "",
    contact: "",
    alamat: "",
    kebutuhan: "",
    status: "",
  });

  const [alert, setAlert] = useState<{
    variant: "success" | "error";
    title: string;
    message: string;
  } | null>(null);

  const [userRole, setUserRole] = useState<string>("");

  const {
    isOpen: isOpenAdd,
    openModal: openModalAdd,
    closeModal: closeModalAdd,
  } = useModal();
  const {
    isOpen: isOpenEdit,
    openModal: openModalEdit,
    closeModal: closeModalEdit,
  } = useModal();

  const [sorting, setSorting] = useState<SortingState>([]);

  const showAlert = (
    variant: "success" | "error",
    title: string,
    message: string
  ) => {
    setAlert({ variant, title, message });
    setTimeout(() => setAlert(null), 4000);
  };

  const fetchLeads = () => {
    const url =
      userRole === "manager"
        ? `${API_BASE}/lead`
        : `${API_BASE}/lead`;

    fetch(url, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    })
      .then((res) => res.json())
      .then((res) => {
        if (res.success) setLeads(res.data);
        else if (res.data) setLeads(res.data); // fallback
      })
      .catch(console.error);
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
      fetchLeads();
    }
  }, [userRole]);

  const handleAddOpen = () => {
    setFormData({
      nik: "",
      nama: "",
      contact: "",
      alamat: "",
      kebutuhan: "",
      status: "",
    });
    openModalAdd();
  };

  const handleAddSave = () => {
    fetch(`${API_BASE}/lead`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify(formData),
    })
      .then(async (res) => {
        const data = await res.json().catch(() => null);
        if (!res.ok) {
          let errorMsg = data?.message || "Gagal tambah lead";
          if (data?.errors) {
            const firstError = Object.values(data.errors)[0] as string[];
            errorMsg = firstError[0] || errorMsg;
          }
          throw new Error(errorMsg);
        }
        return data;
      })
      .then((res) => {
        showAlert("success", "Berhasil", res.message || "Lead berhasil ditambah");
        fetchLeads();
        closeModalAdd();
      })
      .catch((err) => {
        closeModalAdd();
        showAlert("error", "Error", err.message || "Gagal tambah lead");
      });
  };

  const handleEditOpen = (item: LeadType) => {
    setSelectedLead(item);
    setFormData({
      nik: item.nik,
      nama: item.nama,
      contact: item.contact,
      alamat: item.alamat,
      kebutuhan: item.kebutuhan,
      status: item.status || "",
    });
    openModalEdit();
  };

  const handleEditSave = () => {
    if (!selectedLead) return;

    fetch(`${API_BASE}/lead/${selectedLead.id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify(formData),
    })
      .then(async (res) => {
        const data = await res.json().catch(() => null);
        if (!res.ok) {
          let errorMsg = data?.message || "Gagal update lead";
          if (data?.errors) {
            const firstError = Object.values(data.errors)[0] as string[];
            errorMsg = firstError[0] || errorMsg;
          }
          throw new Error(errorMsg);
        }
        return data;
      })
      .then((res) => {
        showAlert("success", "Berhasil", res.message || "Lead berhasil diupdate");
        fetchLeads();
        closeModalEdit();
      })
      .catch((err) => {
        closeModalEdit();
        showAlert("error", "Error", err.message || "Gagal update lead");
      });
  };

  const handleDelete = (id: number) => {
    if (!confirm("Apakah yakin ingin menghapus lead ini?")) return;
    fetch(`${API_BASE}/lead/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    })
      .then((res) => res.json())
      .then((res) => {
        showAlert("success", "Berhasil", res.message || "Lead berhasil dihapus");
        fetchLeads();
      })
      .catch((err) => {
        showAlert("error", "Error", err.message || "Gagal hapus lead");
        console.error(err);
      });
  };

  const columns: ColumnDef<LeadType>[] = [
    { accessorKey: "id", header: "ID" },
    { accessorKey: "nik", header: "NIK" },
    { accessorKey: "nama", header: "Nama" },
    { accessorKey: "contact", header: "Contact" },
    { accessorKey: "alamat", header: "Alamat" },
    { accessorKey: "kebutuhan", header: "Kebutuhan" },
    { accessorKey: "status", 
        header: "Status",
        cell: ({ row }) => row.original.status === "converted" ? (
            <span class="inline-flex items-center px-2.5 py-0.5 justify-center gap-1 rounded-full font-medium text-sm bg-success-50 text-success-600 dark:bg-success-500/15 dark:text-success-500">Converted</span>
        ) : (
            <span class="inline-flex items-center px-2.5 py-0.5 justify-center gap-1 rounded-full font-medium text-sm bg-warning-50 text-warning-600 dark:bg-warning-500/15 dark:text-warning-500">Belum Aktif</span>   
        ),
        },
    ...(userRole === "sales"
      ? [
          {
            id: "actions",
            header: "Action",
            cell: ({ row }) => (
              <div className="flex justify-center gap-2">
                <Button
                  size="sm"
                  variant="primary"
                  onClick={() => handleEditOpen(row.original)}
                >
                  Edit
                </Button>
                <Button
                  size="sm"
                  variant="primary"
                  onClick={() => handleDelete(row.original.id)}
                >
                  Delete
                </Button>
              </div>
            ),
          },
        ]
      : []),
  ];

  const table = useReactTable({
    data: leads,
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

      {userRole === "sales" && (
        <div className="flex justify-end mb-4">
          <Button variant="primary" onClick={handleAddOpen}>
            Tambah Lead
          </Button>
        </div>
      )}

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
        <div className="max-w-full overflow-x-auto">
          {leads.length === 0 ? (
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

      {/* Modal Add */}
      <Modal isOpen={isOpenAdd} onClose={closeModalAdd} className="max-w-[500px] m-4">
        <div className="p-6 bg-white dark:bg-gray-900 rounded-2xl">
          <h4 className="text-lg font-semibold mb-4">Tambah Lead</h4>
          <div className="grid grid-cols-1 gap-4">
            <div>
              <Label>NIK</Label>
              <Input
                type="number"
                value={formData.nik}
                onChange={(e) => setFormData({ ...formData, nik: e.target.value })}
              />
            </div>
            <div>
              <Label>Nama</Label>
              <Input
                type="text"
                value={formData.nama}
                onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
              />
            </div>
            <div>
              <Label>Contact</Label>
              <Input
                type="text"
                value={formData.contact}
                onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
              />
            </div>
            <div>
              <Label>Alamat</Label>
              <Input
                type="text"
                value={formData.alamat}
                onChange={(e) => setFormData({ ...formData, alamat: e.target.value })}
              />
            </div>
            <div>
              <Label>Kebutuhan</Label>
              <Input
                type="text"
                value={formData.kebutuhan}
                onChange={(e) => setFormData({ ...formData, kebutuhan: e.target.value })}
              />
            </div>
            <div>
              <Label>Status</Label>
              <Input
                type="text"
                value={formData.status}
                disabled
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              />
            </div>
          </div>
          <div className="mt-6 flex justify-end gap-2">
            <Button variant="outline" onClick={closeModalAdd}>
              Close
            </Button>
            <Button onClick={handleAddSave}>Save</Button>
          </div>
        </div>
      </Modal>

      {/* Modal Edit */}
      <Modal isOpen={isOpenEdit} onClose={closeModalEdit} className="max-w-[500px] m-4">
        <div className="p-6 bg-white dark:bg-gray-900 rounded-2xl">
          <h4 className="text-lg font-semibold mb-4">Edit Lead</h4>
          <div className="grid grid-cols-1 gap-4">
            <div>
              <Label>NIK</Label>
              <Input
                type="number"
                value={formData.nik}
                onChange={(e) => setFormData({ ...formData, nik: e.target.value })}
              />
            </div>
            <div>
              <Label>Nama</Label>
              <Input
                type="text"
                value={formData.nama}
                onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
              />
            </div>
            <div>
              <Label>Contact</Label>
              <Input
                type="text"
                value={formData.contact}
                onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
              />
            </div>
            <div>
              <Label>Alamat</Label>
              <Input
                type="text"
                value={formData.alamat}
                onChange={(e) => setFormData({ ...formData, alamat: e.target.value })}
              />
            </div>
            <div>
              <Label>Kebutuhan</Label>
              <Input
                type="text"
                value={formData.kebutuhan}
                onChange={(e) => setFormData({ ...formData, kebutuhan: e.target.value })}
              />
            </div>
            <div>
              <Label>Status</Label>
              <Input
                type="text"
                value={formData.status}
                disabled
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              />
            </div>
          </div>
          <div className="mt-6 flex justify-end gap-2">
            <Button variant="outline" onClick={closeModalEdit}>
              Close
            </Button>
            <Button onClick={handleEditSave}>Save Changes</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
