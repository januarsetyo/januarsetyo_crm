# 🌟 Customer Relationship Management (CRM)

![Laravel](https://img.shields.io/badge/Laravel-10.x-red?style=for-the-badge&logo=laravel)
![MySQL](https://img.shields.io/badge/MySQL-8.x-4479A1?style=for-the-badge&logo=mysql)

Sistem **Customer Relationship Management (CRM)** adalah aplikasi berbasis **Laravel (Backend)** dan **React.js (Frontend)** untuk memudahkan pengelolaan data **sales** dan **manager** secara efisien.  
---

## ✨ Fitur Utama
- 🔑 **Autentikasi** dengan role-based access (Sales & Manager).
- 👤 **Manajemen Lead** (Sales input, Manager monitoring).
- 🧾 **Manajemen Customer** (relasi ke Lead).
- 📦 **Manajemen Deal & Deal Detail** (produk + harga negosiasi).
- ✅ **Approval Deal** oleh Manager.
- 📊 **Laporan & Export Excel**.
- 👨‍💼 **Manajemen User** (khusus Manager)
---

## 🚀 Instalasi & Persiapan

### 🔹 1. Backend (Laravel)

1. **Clone repository branch backend:**
   ```bash
   git clone <url-repo-backend> backend
   cd backend

### Install Dependencies

composer install

### Salin file .env:

cp .env.example .env


### Sesuaikan konfigurasi database:

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=name_database
DB_USERNAME=root
DB_PASSWORD=

### Generate Key, migrasi & seeder:

php artisan key:generate
php artisan migrate
php artisan db:seed


### Jalankan server Laravel:

php artisan serve
