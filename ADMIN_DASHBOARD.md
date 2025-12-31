# Admin Dashboard Setup

## Akses Dashboard Admin

Untuk mengakses dashboard admin, buka URL:
```
http://localhost:3000/admin
```

## Login Credentials

**Password:** `admin123`

## Fitur Admin Dashboard

### 1. Statistik
- **Total Peserta**: Menampilkan jumlah total peserta yang telah mendaftar
- **Status Konfirmasi**: Menampilkan jumlah peserta dengan status 'confirmed'
- **Pesan Diterima**: Menampilkan jumlah peserta yang mengirimkan pesan Natal

### 2. Tabel Laporan Peserta
Menampilkan data lengkap peserta dalam format tabel dengan kolom:
- **No.**: Nomor urut peserta
- **Nama**: Nama peserta
- **Sekolah**: Asal sekolah peserta
- **Gereja**: Asal gereja peserta
- **No. WhatsApp**: Nomor WhatsApp peserta (klik untuk buka WhatsApp)
- **Pesan Natal**: Preview pesan Natal (jika ada)
- **Tanggal Daftar**: Tanggal peserta melakukan registrasi

### 3. Fungsi Aksi
- **Refresh Data**: Memperbarui data peserta dari database
- **Download CSV**: Mengunduh laporan peserta dalam format CSV

## Catatan

- Dashboard menggunakan localStorage untuk autentikasi session
- Password disimpan sebagai konstanta (untuk production, gunakan environment variable)
- Data peserta diambil dari Backendless database
- Nomor WhatsApp dapat diklik untuk membuka WhatsApp langsung
