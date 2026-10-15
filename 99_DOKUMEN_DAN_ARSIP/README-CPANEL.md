# INPOS — Paket cPanel Multi-Tenant (Subdomain Toko Langsung)

**Status:** kode sumber untuk deployment cPanel, bukan installer 1-klik. Membutuhkan Setup Node.js App (Node 22+), Terminal/SSH, MySQL, domain HTTPS dan kompatibilitas Prisma.

## Tujuan domain

| Domain | Folder | Fungsi |
|---|---|---|
| `inpos.id` | `01_LANDING_INPOS_ID/` | Landing Page |
| `app.inpos.id` | `02_APLIKASI_APP_INPOS_ID/` | Login Owner/Karyawan dan Kasir |
| `adms.inpos.id` | `03_ADMIN_ADMS_INPOS_ID/` | Super Admin |
| `api.inpos.id` | `05_BACKEND_NODEJS_INPOS_API/` | NestJS API di luar public_html |
| `inpos.inpos.id` | `04_WEBTOKO_NAMATOKO_INPOS_ID/` | Web Toko awal |
| `namatoko.inpos.id` | folder Web Toko yang sama | Web Toko tenant lainnya |

## Akun awal yang Anda minta

| Akses | Toko/subdomain | Username | PIN pertama |
|---|---|---|---|
| Owner (`https://app.inpos.id`) | `inpos` | `inpos` | `112233` |
| Super Admin (`https://adms.inpos.id`) | — | `superinpos` | `112233` |

**Keamanan:** kedua akun wajib mengganti PIN saat pertama kali berhasil login. API melarang akses menu operasional sampai PIN diubah. PIN disimpan sebagai hash bcrypt, tidak di frontend. Jangan bagikan PIN dalam dokumentasi yang dipublikasikan. Sebaiknya gunakan PIN acak yang berbeda, karena 6 digit terbatas untuk akun admin.

**Seed:** `npm run seed:initial` membuat hanya toko `inpos` dan kedua akun pada database **baru**. Tidak membuat akun/produk/transaksi demo. Script ini idempotent dan tidak menimpa PIN/data yang sudah ada. Jika hosting telah berisi akun demo sebelumnya, script **tidak menghapus data itu otomatis**; lakukan backup dan audit data dulu, karena penghapusan tenant menghilangkan transaksi.

## 1 — Domain DNS, Virtual Host & SSL

Buat subdomain `app`, `adms`, `api`, dan `inpos` di menu Domains cPanel. Tautkan `inpos.inpos.id` ke folder Web Toko statis. Pastikan HTTPS berlaku untuk semuanya.

**Untuk subdomain dinamis `namatoko.inpos.id`:** minta provider mengaktifkan ketiga komponen di bawah secara bersamaan:

1. **Wildcard DNS** `*.inpos.id` menunjuk IP hosting (`A`) atau nama host yang disetujui provider. DNS hanya mengarahkan nama; bukan virtual host.
2. **Wildcard subdomain / Apache virtual host** yang memetakan semua subdomain tenant ke folder Web Toko yang sama. Jangan sampai wildcard mengambil domain yang dilayani khusus (`app`, `adms`, `api`, `www`); domain eksplisit harus diprioritaskan. Beberapa cPanel shared hosting **tidak mendukung wildcard vhost** tanpa bantuan penyedia.
3. **Sertifikat HTTPS wildcard** mencakup `*.inpos.id` (biasanya validasi DNS-01). AutoSSL biasa dapat saja **tidak menerbitkan sertifikat wildcard**. `*.inpos.id` mencakup `inpos.inpos.id`, tetapi tidak mencakup subdomain dua tingkat seperti `x.shop.inpos.id`.

Jika wildcard belum didukung, **gunakan `inpos.inpos.id` sebagai subdomain toko pertama** dan buat subdomain toko berikutnya secara manual, masing-masing menunjuk document root Web Toko sama. Aplikasi dan API tidak boleh menganggap hostname yang belum dikonfigurasi otomatis bisa diakses.

## 2 — Upload frontend

Upload **isi folder** `01`, `02`, `03`, `04` ke document root masing-masing, termasuk file tersembunyi `.htaccess`. File `04` harus tersedia untuk hostname `inpos.inpos.id`. Untuk toko baru, gunakan wildcard yang telah terkonfigurasi atau buat subdomain manual menuju folder tersebut. Frontend statis tidak memerlukan `npm install`.

## 3 — Upload API dan buat database

Buat database MySQL dan user di cPanel; beri privileges sesuai kebutuhan inisialisasi. Upload isi `05_BACKEND_NODEJS_INPOS_API` ke `/home/CPANELUSER/inpos-api` **di luar public_html**. Jangan upload file `.env`, `scripts/seed-initial.ts` atau node_modules ke public_html.

Di **Setup Node.js App**:

```text
Node.js : 22.x atau lebih baru
Application mode : Production
Application root : inpos-api
Application URL : api.inpos.id /
Startup file : app.js
```

## 4 — Atur `.env`

Salin `.env.cpanel.example` menjadi `.env` di root API; isi nama database/pengguna/password sesungguhnya, dan ganti semua `CHANGE_` termasuk secret JWT/CSRF dan referral. Password database berkarakter khusus harus URL-encoded. Jangan mengirim `.env` atau secret ke publik.

Akun awal yang diminta ditentukan melalui enam variabel berikut:

```env
INITIAL_SUPERADMIN_USERNAME=superinpos
INITIAL_SUPERADMIN_PIN=112233
INITIAL_STORE_SLUG=inpos
INITIAL_STORE_NAME=INPOS
INITIAL_OWNER_USERNAME=inpos
INITIAL_OWNER_PIN=112233
```

PIN di `.env` diperlukan **hanya saat proses seed**. Setelah akun berhasil dibuat, **hapus `INITIAL_SUPERADMIN_PIN` dan `INITIAL_OWNER_PIN` dari `.env`**, kemudian restart API agar tidak terus tersimpan di konfigurasi. Tidak perlu menyimpan PIN awal pada server setelah seed.

## 5 — Terminal cPanel / Node virtualenv

Gunakan perintah aktivasi virtualenv Node.js yang ditampilkan oleh cPanel (setiap hosting dapat berbeda), lalu:

```bash
cd ~/inpos-api
node -v
npm install --include=dev
npx prisma generate
npm run build
# Hanya untuk database baru KOSONG:
npx prisma db push
npm run seed:initial
npm run cpanel:check
```

**Catatan penting:** `prisma db push` hanya untuk database kosong pada starter. Pada database berjalan/berisi data, lakukan perubahan schema menggunakan migrasi Prisma yang ditinjau dan backup; penambahan `mustChangePin` perlu diterapkan melalui migrasi.

Restart aplikasi dari Setup Node.js App.

## 6 — Uji

1. Buka `https://api.inpos.id/v1/health` → harus JSON status ok.
2. Buka `https://adms.inpos.id`; login `superinpos` dengan PIN awal dan langsung ganti PIN.
3. Buka `https://app.inpos.id`; isi subdomain `inpos`, login username `inpos`, PIN awal; langsung ganti PIN.
4. Tambah produk di Owner, buka `https://inpos.inpos.id` dan pastikan hanya produk tenant `inpos` yang ditampilkan.
5. Masukkan pesanan pada Web Toko lalu cek menu Pesanan Web Toko di Owner.
6. Tambah tenant kedua lewat registrasi yang terkendali untuk uji isolasi, bukan dari seed demo. Pastikan setiap tenant hanya membaca datanya.
7. Pastikan login gagal untuk PIN awal setelah diganti.

## Jika ada masalah

- Subdomain toko menampilkan halaman salah / 404: cek mapping document root, wildcard vhost, DNS dan SSL.
- SSL error subdomain: periksa sertifikat `*.inpos.id` dan DNS-01 atau pasang sertifikat untuk subdomain manual.
- 500/503 API: cek log Passenger, Node virtualenv, `dist/main.js` dan ENV.
- Prisma P1000/P1001: periksa user/password/host DB.
- Login pertama tidak bisa membuka Dashboard: **wajib ubah PIN** pada form yang disediakan; cek tabel `User.mustChangePin` sudah dimigrasikan.
- Untuk akun yang sudah pernah dibuat, seed tidak mengubah PIN dan tidak menghapus data. Gunakan prosedur pemulihan admin dengan verifikasi identitas, jangan reset database secara membabi buta.

## Batasan

Ini merupakan starter Multi-Tenant terhubung API, bukan hasil migrasi semua fitur INPOS HTML v721. Belum diuji end-to-end dengan MySQL / Passenger pada hosting Anda; jangan gunakan untuk pembayaran riil sebelum uji keamanan, beban, isolasi tenant, dan backup. Setiap login memakai PIN 6 digit sehingga wajib perlindungan rate limit, pemantauan dan pembatasan percobaan login.

## Patch pemeriksaan 14 Oktober 2026

Lihat `06_PANDUAN_DAN_TOOLS/LAPORAN-PERBAIKAN-BUG-2026-10-14.txt` untuk daftar perubahan, pembatasan yang belum diimplementasikan, dan hasil tes. Bugfix tidak mengubah schema Prisma; saat memperbarui instalasi aktif, lakukan backup dan jalankan kembali `npm install --include=dev`, `npx prisma generate`, `npm run typecheck`, `npm run build`, dan `npm run cpanel:check`, lalu restart Node.js App. **Sesi yang diterbitkan kode versi sebelumnya akan diminta login ulang** akibat peningkatan keamanan PIN. PWA memakai cache shell versi 2; browser mungkin perlu reload setelah service worker memperbarui aset.


## Optimasi frontend — 15 Oktober 2026

Frontend pada ZIP ini **sudah menggunakan nama aset CSS/JavaScript dengan hash**, gambar landing eksternal yang dideduplikasi, kompresi Brotli/gzip bila didukung Apache, cache immutable pada aset versi, dan pembaruan service worker PWA. Aplikasi kasir dan Web Toko menampilkan maksimum 48 kartu produk pada render pertama, dan daftar Produk & Stok menampilkan 60 baris per render. Tombol **Tampilkan lainnya** menambahnya secara bertahap. Pencarian tetap mencakup seluruh data yang sudah diterima dari API.

1. **Backup** document root empat frontend dan file `.htaccess` sebelum update.
2. Upload ulang **SELURUH ISI** masing-masing folder `01`, `02`, `03`, `04` ke document root yang sesuai, **termasuk subfolder `assets/` dan `.htaccess`**. Untuk pembaruan situs aktif, upload folder `assets/` dahulu, kemudian `index.html`, dan akhirnya `sw.js` (khusus PWA) agar halaman baru tidak menunjuk ke aset yang belum tersedia. Jangan unggah folder `07_REFERENSI_JANGAN_UPLOAD` ke domain publik.
3. Hapus dari hosting file frontend lama `/client.js`, `/app.js`, `/admin.js`, `/store.js`, `/style.css` **hanya setelah** halaman baru berfungsi. Bila halaman lama masih terbuka di perangkat, aset lama mungkin masih dibutuhkan sampai reload.
4. Di `app.inpos.id`, tutup/buka kembali PWA atau reload setelah service worker `v3` mengambil alih. Cache versi lama otomatis dibersihkan pada aktivasi SW baru.
5. Pastikan mod_brotli atau mod_deflate aktif di Apache jika ingin kompresi benar-benar terjadi; beberapa penyedia cPanel membatasi `.htaccess`. Uji header `Content-Encoding` pada Network browser / `curl -I -H 'Accept-Encoding: br,gzip' https://app.inpos.id/`.
6. JS/CSS portal operasional pada versi awal sudah ditulis compact. ZIP ini **belum menjanjikan minifikasi JS tingkat compiler**, karena minifier seperti esbuild tidak tersedia dalam lingkungan build; hashed-file + compression lebih aman dari minifikasi asal-asalan.
7. Pada paket optimasi frontend tanggal 15 Oktober sebelumnya, API belum berubah. **Paket REVISI LENGKAP ini telah menambahkan pagination dan pencarian server-side**; batas legacy 500 produk/200 produk Web Toko hanya dipertahankan untuk kompatibilitas client lama. Untuk skala jutaan item tetap diperlukan pemantauan indeks, kapasitas server, dan pencarian full-text khusus.

Hasil optimasi dan cara pengujian: lihat `06_PANDUAN_DAN_TOOLS/LAPORAN-OPTIMASI-FRONTEND.txt`.


## Revisi lanjutan — 15 Oktober 2026 (WAJIB DIBACA)

Versi ini mengubah **backend, frontend, dan schema Prisma**. Tidak cukup hanya upload folder frontend. Berikut urutan aman untuk database lama/berisi transaksi:

1. **Backup database MySQL penuh**, file aplikasi, dan `.env`. Pastikan cadangan bisa dipulihkan; uji dahulu pada **staging**.
2. Berhentikan proses API/aktifkan maintenance window dan pastikan tidak ada transaksi baru selama upgrade. Schema baru menambah kolom `StoreOrder.requestId` yang harus tersedia **sebelum** backend baru diaktifkan.
3. Untuk **database lama** saja, inspeksi dan jalankan **sekali** SQL di `06_PANDUAN_DAN_TOOLS/MIGRASI/2026-10-15-upgrade-INPOS.sql` via phpMyAdmin/MySQL. Jangan menjalankan SQL ini pada database kosong yang dibuat dari schema terbaru. Pastikan indeks/kolom tersebut memang belum tersedia.
4. Upload backend terbaru ke `~/inpos-api` (di luar `public_html`), simpan `.env` lama yang aman, lalu jalankan `npm install --include=dev`, `npx prisma generate`, `npm run typecheck`, `npm run build`, `npm run cpanel:check`, restart API; periksa `GET https://api.inpos.id/v1/health`.
5. Upload frontend dengan urutan: folder `assets` dahulu, kemudian `index.html`, lalu `sw.js` khusus kasir. Unggah `.htaccess` dengan hati-hati (simpan backup konfigurasi lama). Pastikan 4 domain menggunakan frontend baru yang sama versi backend-nya.
6. Uji tenant kedua, login Owner/Karyawan/Admin, produk lebih dari 500, transaksi, pencarian, laporan, pesanan Web Toko, QRIS manual, logout, dan PWA. Periksa log Node.js/MySQL serta metode restore.

**Penambahan:** `GET /v1/products?limit=60&q=...&cursor=...` (tetap mempertahankan format array tanpa query), `GET /v1/stores/:slug/products`, pagination `admin/tenants` dan `admin/invoices`, `GET /v1/transactions/summary`, `requestId` idempoten untuk pesanan Web Toko, validasi stok dan nominal, serta indeks database.

**Batasan:** hasil pengujian adalah pemeriksaan sintaks TS/JS dan simulasi Chromium dengan API tiruan; **bukan** uji end-to-end NestJS + MySQL cPanel, transaksi pembayaran riil, atau load test. Schema Prisma bertambah dan migrasi SQL belum dijalankan pada database pengguna. INPOS ini tetap *starter multi-tenant*, belum migrasi lengkap fitur INPOS HTML versi lama. Transaksi konfirmasi Web Toko **belum otomatis tercatat** ke buku penjualan, fitur Multi Satuan belum menghitung harga kemasan terpisah, dan sistem pembayaran QRIS masih memerlukan verifikasi manual. Jangan gunakan fitur tersebut sebagai sistem pembayaran/akuntansi penuh sebelum implementasi lanjutan.
