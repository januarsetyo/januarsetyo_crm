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
import { Table, TableBody, TableCell, TableHeader, TableRow } from "../../components/ui/table";
import Label from "../../components/form/Label";
import Input from "../../components/form/input/InputField";
import Button from "../../components/ui/button/Button";
import { Modal } from "../../components/ui/modal";
import { useModal } from "../../hooks/useModal";
import Alert from "../../components/ui/alert/Alert";

interface ProductType {
  id: number;
  nama_product: string;
  deskripsi: string;
  hpp: number;
  margin: number;
  price: number;
}

export default function ProductTable() {
  const [products, setProducts] = useState<ProductType[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<ProductType | null>(null);
  const [formData, setFormData] = useState<{
    nama_product: string;
    deskripsi: string;
    hpp: string;
    margin: string;
    price: number;
  }>({
    nama_product: "",
    deskripsi: "",
    hpp: "",
    margin: "",
    price: 0,
  });

  useEffect(() => {
  const hppNum = parseFloat(formData.hpp) || 0;
  const marginNum = parseFloat(formData.margin) || 0;
  const calcPrice = hppNum + (hppNum * marginNum) / 100;
  setFormData((prev) => ({ ...prev, price: calcPrice }));
}, [formData.hpp, formData.margin]);

const formatRupiah = (value: number | string) => {
  const num = typeof value === "string" ? parseFloat(value) : value;
  if (isNaN(num)) return "Rp 0";
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(num);
};

  const [alert, setAlert] = useState<{
    variant: "success" | "error";
    title: string;
    message: string;
  } | null>(null);

  const [userRole, setUserRole] = useState<string>(""); // cek role login

  const { isOpen: isOpenAdd, openModal: openModalAdd, closeModal: closeModalAdd } = useModal();
  const { isOpen: isOpenEdit, openModal: openModalEdit, closeModal: closeModalEdit } = useModal();

  const [sorting, setSorting] = useState<SortingState>([]);

  const showAlert = (variant: "success" | "error", title: string, message: string) => {
    setAlert({ variant, title, message });
    setTimeout(() => setAlert(null), 4000);
  };

  const fetchProducts = () => {
    fetch("http://127.0.0.1:8000/api/product", {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    })
      .then((res) => res.json())
      .then((res) => {
        if (res.success) setProducts(res.data);
        else if (res.data) setProducts(res.data); // kadang backend langsung return data
      })
      .catch(console.error);
  };

  const fetchUserRole = () => {
    fetch("http://127.0.0.1:8000/api/me", {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    })
      .then((res) => res.json())
      .then((res) => {
        setUserRole(res.role || "");
      })
      .catch(console.error);
  };

  useEffect(() => {
    fetchProducts();
    fetchUserRole();
  }, []);

  const handleAddOpen = () => {
    setFormData({ nama_product: "", deskripsi: "", hpp: "", margin: ""  , price: 0 });
    openModalAdd();
  };

  const handleAddSave = () => {
    fetch("http://127.0.0.1:8000/api/product", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify({
        ...formData,
        hpp: Number(formData.hpp),
        margin: Number(formData.margin),
      }),
    })
      .then(async (res) => {
        const data = await res.json().catch(() => null);
        if (!res.ok) {
          let errorMsg = data?.message || "Gagal tambah product";
          if (data?.errors) {
            const firstError = Object.values(data.errors)[0] as string[];
            errorMsg = firstError[0] || errorMsg;
          }
          throw new Error(errorMsg);
        }
        return data;
      })
      .then((res) => {
        showAlert("success", "Berhasil", res.message || "Product berhasil ditambah");
        fetchProducts();
        closeModalAdd();
      })
      .catch((err) => {
        closeModalAdd();
        showAlert("error", "Error", err.message || "Gagal tambah product");
      });
  };

  const handleEditOpen = (item: ProductType) => {
    setSelectedProduct(item);
    setFormData({
      nama_product: item.nama_product,
      deskripsi: item.deskripsi,
      hpp: item.hpp.toString(),
      margin: item.margin.toString(),
        price: item.price,
    });
    openModalEdit();
  };

  const handleEditSave = () => {
    if (!selectedProduct) return;

    fetch(`http://127.0.0.1:8000/api/product/${selectedProduct.id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify({
        ...formData,
        hpp: Number(formData.hpp),
        margin: Number(formData.margin),
      }),
    })
      .then(async (res) => {
        const data = await res.json().catch(() => null);
        if (!res.ok) {
          let errorMsg = data?.message || "Gagal update product";
          if (data?.errors) {
            const firstError = Object.values(data.errors)[0] as string[];
            errorMsg = firstError[0] || errorMsg;
          }
          throw new Error(errorMsg);
        }
        return data;
      })
      .then((res) => {
        showAlert("success", "Berhasil", res.message || "Product berhasil diupdate");
        fetchProducts();
        closeModalEdit();
      })
      .catch((err) => {
        closeModalEdit();
        showAlert("error", "Error", err.message || "Gagal update product");
      });
  };

  const handleDelete = (id: number) => {
    if (!confirm("Apakah yakin ingin menghapus product ini?")) return;
    fetch(`http://127.0.0.1:8000/api/product/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    })
      .then((res) => res.json())
      .then((res) => {
        showAlert("success", "Berhasil", res.message || "Product berhasil dihapus");
        fetchProducts();
      })
      .catch((err) => {
        showAlert("error", "Error", err.message || "Gagal hapus product");
        console.error(err);
      });
  };

  // Columns
  const columns: ColumnDef<ProductType>[] = [
    { accessorKey: "id", header: "ID" },
    { accessorKey: "nama_product", header: "Nama Product" },
    { accessorKey: "deskripsi", header: "Deskripsi" },
    {
        accessorKey: "hpp",
        header: "HPP",
        cell: ({ row }) => formatRupiah(row.original.hpp),
    },
    { accessorKey: "margin", header: "Margin (%)" },
    {
        accessorKey: "price",
        header: "Harga Jual",
        cell: ({ row }) => formatRupiah(row.original.price),
    },
    ...(userRole === "sales"
      ? [
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
        ]
      : []),
  ];

  const table = useReactTable({
    data: products,
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
          <Alert variant={alert.variant} title={alert.title} message={alert.message} />
        </div>
      )}

      {/* Button Add hanya muncul kalau role = sales */}
      {userRole === "sales" && (
        <div className="flex justify-end mb-4">
          <Button variant="primary" onClick={handleAddOpen}>
            Tambah Product
          </Button>
        </div>
      )}

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
                      {flexRender(header.column.columnDef.header, header.getContext())}
                      {{
                        asc: " 🔼",
                        desc: " 🔽",
                      }[header.column.getIsSorted() as string] ?? null}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="text-center align-middle">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
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
          <h4 className="text-lg font-semibold mb-4">Tambah Product</h4>
          <div className="grid grid-cols-1 gap-4">
            <div>
              <Label>Nama Product</Label>
              <Input
                type="text"
                value={formData.nama_product}
                onChange={(e) => setFormData({ ...formData, nama_product: e.target.value })}
              />
            </div>
            <div>
              <Label>Deskripsi</Label>
              <Input
                type="text"
                value={formData.deskripsi}
                onChange={(e) => setFormData({ ...formData, deskripsi: e.target.value })}
              />
            </div>
            <div>
              <Label>HPP</Label>
              <Input
                type="number"
                value={formData.hpp}
                onChange={(e) => setFormData({ ...formData, hpp: e.target.value })}
              />
            </div>
            <div>
              <Label>Margin (%)</Label>
              <Input
                type="number"
                value={formData.margin}
                onChange={(e) => setFormData({ ...formData, margin: e.target.value })}
              />
            </div>
            <div>
                <Label>Price (otomatis)</Label>
                <Input
                type="text"
                value={formatRupiah(formData.price)}
                disabled
                className="bg-gray-100"
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
          <h4 className="text-lg font-semibold mb-4">Edit Product</h4>
          <div className="grid grid-cols-1 gap-4">
            <div>
              <Label>Nama Product</Label>
              <Input
                type="text"
                value={formData.nama_product}
                onChange={(e) => setFormData({ ...formData, nama_product: e.target.value })}
              />
            </div>
            <div>
              <Label>Deskripsi</Label>
              <Input
                type="text"
                value={formData.deskripsi}
                onChange={(e) => setFormData({ ...formData, deskripsi: e.target.value })}
              />
            </div>
            <div>
              <Label>HPP</Label>
              <Input
                type="number"
                value={formData.hpp}
                onChange={(e) => setFormData({ ...formData, hpp: e.target.value })}
              />
            </div>
            <div>
              <Label>Margin (%)</Label>
              <Input
                type="number"
                value={formData.margin}
                onChange={(e) => setFormData({ ...formData, margin: e.target.value })}
              />
            </div>
            <div>
            <Label>Price (otomatis)</Label>
            <Input
            type="text"
            value={formatRupiah(formData.price)}
            disabled
            className="bg-gray-100"
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
