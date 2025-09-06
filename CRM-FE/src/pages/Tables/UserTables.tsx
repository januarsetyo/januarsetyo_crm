import { use, useEffect, useState } from "react";
import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  SortingState,
  ColumnDef,
  useReactTable,
} from "@tanstack/react-table";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "../../components/ui/table";
import Label from "../../components/form/Label";
import Input from "../../components/form/input/InputField";
import Button from "../../components/ui/button/Button";
import { Modal } from "../../components/ui/modal";
import { useModal } from "../../hooks/useModal";
import Alert from "../../components/ui/alert/Alert"; 

interface UserType {
  id: number;
  name: string;
  nip: string;
  role: "manager" | "sales";
}



export default function UserTable() {
  const API_BASE = import.meta.env.VITE_API_BASE_URL;
  const [users, setUsers] = useState<UserType[]>([]);
  const [selectedUser, setSelectedUser] = useState<UserType | null>(null);
  const [formData, setFormData] = useState<{
    name: string;
    nip: string;
    role: "manager" | "sales";
    password: string;
  }>({
    name: "",
    nip: "",
    role: "manager",
    password: "",
  });

    const [alert, setAlert] = useState<{
    variant: "success" | "error";
    title: string;
    message: string;
    } | null>(null);

      const showAlert = (
    variant: "success" | "error",
    title: string,
    message: string
  ) => {
    setAlert({ variant, title, message });
    setTimeout(() => setAlert(null), 4000); // auto hide 4 detik
  };

  const { isOpen: isOpenAdd, openModal: openModalAdd, closeModal: closeModalAdd } = useModal();
  const { isOpen: isOpenEdit, openModal: openModalEdit, closeModal: closeModalEdit } = useModal();

  const [sorting, setSorting] = useState<SortingState>([]);


  const fetchUsers = () => {
    fetch(`${API_BASE}/user`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    })
      .then((res) => res.json())
      .then((res) => {
        if (res.success) setUsers(res.data);
      })
      .catch(console.error);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleAddOpen = () => {
    setFormData({ name: "", nip: "", role: "manager", password: "" });
    openModalAdd();
  };

  const handleAddSave = () => {
    fetch(`${API_BASE}/user`, {
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
        let errorMsg = data?.message || "Gagal tambah user";
        if (data?.errors) {
          const firstError = Object.values(data.errors)[0] as string[];
          errorMsg = firstError[0] || errorMsg;
        }
        throw new Error(errorMsg);
        }
        return data;
      })
      .then((res) => {
        showAlert("success", "Berhasil", res.message || "User berhasil ditambah");
        fetchUsers();
        closeModalAdd();
      })
      .catch((err) => {
        closeModalAdd();
        showAlert("error", "Error", "Gagal tambah user, silahkan coba lagi dan cek form inputan anda");
      });
  };


  const handleEditOpen = (item: UserType) => {
    setSelectedUser(item);
    setFormData({ name: item.name, nip: item.nip, role: item.role, password: "" });
    openModalEdit();
  };

  const handleEditSave = () => {
    if (!selectedUser) return;

    const payload: any = {
      name: formData.name,
      nip: formData.nip,
      role: formData.role,
    };
    if (formData.password.trim() !== "") payload.password = formData.password;

    fetch(`${API_BASE}/user/${selectedUser.id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify(payload),
    })
      .then(async (res) => {
        const data = await res.json().catch(() => null);
        if (!res.ok) {
        let errorMsg = data?.message || "Gagal update user";
        if (data?.errors) {
          const firstError = Object.values(data.errors)[0] as string[];
          errorMsg = firstError[0] || errorMsg;
        }
        throw new Error(errorMsg);
        }
        return data;
      })
      .then((res) => {
        showAlert("success", "Berhasil", res.message || "User berhasil diupdate");
        fetchUsers();
        closeModalEdit();
      })
      .catch((err) => {
        closeModalEdit();
        showAlert("error", "Error", "Gagal update user, silahkan coba lagi dan cek form inputan anda");
    
      });
  };

 
  const handleDelete = (id: number) => {
    if (!confirm("Apakah yakin ingin menghapus user ini?")) return;
    fetch(`${API_BASE}/user/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    })
      .then((res) => res.json())
      .then((res) => {
        showAlert("success", "Berhasil", res.message || "User berhasil dihapus");
        fetchUsers();
      })
      .catch((err) => {
        showAlert("error", "Error", err.message || "Gagal hapus user");
        console.error(err);
      });
  };

  // Columns
  const columns: ColumnDef<UserType>[] = [
    { accessorKey: "id", header: "ID" },
    { accessorKey: "name", header: "Nama User" },
    { accessorKey: "nip", header: "NIP" },
    { accessorKey: "role", header: "Role" },
    {
      id: "actions",
      header: "Action",
      cell: ({ row }) => (
        <div className="flex justify-center gap-2">
          <Button size="sm" variant="primary" onClick={() => handleEditOpen(row.original)}>
            Edit
          </Button>
          <Button size="sm" variant="primary" onClick={() => handleDelete(row.original.id)}>
            Delete
          </Button>
        </div>
      ),
    },
  ];

  const table = useReactTable({
    data: users,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  return (
    <div>
    {/* Alert */}
      {alert && (
        <div className="mb-4">
          <Alert
            variant={alert.variant}
            title={alert.title}
            message={alert.message}
          />
        </div>
      )}
      {/* Button Add */}
      <div className="flex justify-end mb-4">
        <Button variant="primary" onClick={handleAddOpen}>
          Tambah User
        </Button>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
        <div className="max-w-full overflow-x-auto">
          {users.length === 0 ? (
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
            Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
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
          <h4 className="text-lg font-semibold mb-4">Tambah User</h4>
          <div className="grid grid-cols-1 gap-4">
            <div>
              <Label>Nama User</Label>
              <Input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div>
              <Label>NIP</Label>
              <Input
                type="text"
                value={formData.nip}
                onChange={(e) => setFormData({ ...formData, nip: e.target.value })}
              />
            </div>
            <div>
              <Label>Role</Label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value as "manager" | "sales" })}
                className="w-full border rounded px-2 py-1"
              >
                <option value="manager">Manager</option>
                <option value="sales">Sales</option>
              </select>
            </div>
            <div>
              <Label>Password</Label>
              <Input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
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
          <h4 className="text-lg font-semibold mb-4">Edit User</h4>
          <div className="grid grid-cols-1 gap-4">
            <div>
              <Label>Nama User</Label>
              <Input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div>
              <Label>NIP</Label>
              <Input
                type="text"
                value={formData.nip}
                onChange={(e) => setFormData({ ...formData, nip: e.target.value })}
              />
            </div>
            <div>
              <Label>Role</Label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value as "manager" | "sales" })}
                className="w-full border rounded px-2 py-1"
              >
                <option value="manager">Manager</option>
                <option value="sales">Sales</option>
              </select>
            </div>
            <div>
              <Label>Password</Label>
              <Input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="Kosongkan jika tidak diubah"
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
