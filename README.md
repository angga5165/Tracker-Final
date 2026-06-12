# 💰 Expense Tracker — Aplikasi Manajemen Keuangan Pribadi

Aplikasi web pencatatan keuangan pribadi modern yang dirancang untuk memantau pengeluaran, pemasukan, dan saldo dana secara real-time. Proyek ini dideploy di **Vercel** dengan integrasi database dan autentikasi instan menggunakan **Supabase**.

> 💡 **Vibe Coding Portfolio Piece**: Aplikasi ini dirancang, dikembangkan, dan didebug secara kolaboratif bersama **Antigravity** (AI Coding Assistant dari Google DeepMind) dalam sesi pairing programming interaktif.

---

## 🚀 Fitur Utama

Aplikasi ini dilengkapi dengan fitur manajemen keuangan lengkap yang dikemas dalam antarmuka premium dan responsif:

1. **Dashboard Interaktif**:
   * **Saldo Real-time**: Pemantauan saldo kumulatif terpisah untuk Dompet (Tunai) dan ATM (Rekening Bank).
   * **KPI Ringkasan Bulanan**: Menampilkan total pengeluaran, pemasukan, rata-rata harian, dan hari pengeluaran tertinggi.
   * **Grafik Tren & Kategori**: Visualisasi instan untuk tren pengeluaran harian dan persentase kategori menggunakan **Chart.js**.

2. **Input Harian (Manajemen Transaksi)**:
   * Mendukung tiga tipe transaksi: **Pengeluaran (Expense)**, **Pemasukan (Income)**, dan **Transfer Saldo** antar Dompet ↔ ATM.
   * Input divalidasi secara interaktif sebelum disimpan ke database.
   * List transaksi yang dilengkapi fitur **Inline Edit** (edit langsung di tempat) dan tombol hapus cepat.

3. **Rekap Harian & Ekspor Laporan**:
   * Tabel matriks pengeluaran harian per kategori untuk melacak konsumsi uang harian.
   * **Ekspor Multi-Format**:
     * Unduh laporan format **CSV** instan.
     * Ekspor profesional ke **Excel (.xlsx)** menggunakan **SheetJS** dengan lembar kerja terpisah (*Cover*, *Input Harian*, *Rekap Harian*, *Analisis Kategori*, *Arus Kas*, dan *Grafik*).

4. **Analisis Kategori (Budgeting)**:
   * Bandingkan pengeluaran aktual dengan alokasi budget bulanan yang Anda tetapkan.
   * Progress bar dinamis yang akan berubah warna (menjadi merah/peringatan) jika pengeluaran melebihi budget.

5. **Visualisasi Lanjutan (Heatmap)**:
   * **Kalender Pengeluaran**: Sistem visualisasi mirip GitHub *contribution graph* yang menampilkan tingkat kepadatan/ketinggian pengeluaran harian menggunakan gradasi warna.

6. **Pengaturan Akun & Saldo Awal**:
   * Kustomisasi saldo awal tunai dan ATM di awal pelacakan.
   * Manajemen data bersih dengan tombol **Reset Data** untuk menghapus riwayat transaksi.

---

## 🛠️ Stack Teknologi

* **Frontend**: HTML5, Vanilla CSS3 (Custom Variables, Transisi Tema, Glassmorphism, Layout Grid & Flexbox), Modern JavaScript (ES6+).
* **Backend & Database**: **Supabase** (PostgreSQL) untuk penyimpanan data aman dan persisten.
* **Autentikasi**: **Supabase Auth** (Log in / Sign up) untuk memisahkan data tiap pengguna secara aman.
* **Hosting / Deployment**: **Vercel** (untuk rilis cepat).
* **Pihak Ketiga**:
  * **Chart.js** (Grafik Visualisasi)
  * **Lucide Icons** (Ikon UI)
  * **SheetJS / xlsx** (Generator Spreadsheet Excel)

---

## ⚙️ Cara Menjalankan Secara Lokal

Karena proyek ini menggunakan vanilla HTML/JS/CSS murni tanpa compiler yang kompleks, Anda bisa langsung menjalankannya dengan mudah:

1. Clone repositori ini:
   ```bash
   git clone https://github.com/username/project-name.git
   ```
2. Jalankan local server (misal menggunakan ekstensi **Live Server** di VS Code, atau `npx serve`):
   ```bash
   npx serve .
   ```
3. Buka browser di `http://localhost:3000`.

---

## 🛡️ Struktur Database Supabase

Aplikasi ini terintegrasi dengan 3 tabel utama di Supabase:

1. **`transactions`**:
   * `id` (text, primary key)
   * `user_id` (uuid, foreign key ke auth.users)
   * `date` (date)
   * `day_name` (text)
   * `type` (text - 'expense' | 'income' | 'transfer')
   * `source` (text - 'Dompet' | 'ATM')
   * `category` (text)
   * `description` (text)
   * `amount` (numeric)
   * `transfer_to` (text)
   * `income_category` (text)

2. **`budgets`**:
   * `user_id` (uuid, primary key)
   * `month` (text, primary key - format 'YYYY-MM')
   * `categories` (jsonb)
   * `total_budget` (numeric)

3. **`balances`**:
   * `user_id` (uuid, primary key)
   * `initial_dompet` (numeric)
   * `initial_atm` (numeric)
   * `initial_date` (date)
   * `updated_at` (timestamptz)

---

*Dibuat dengan penuh ❤️ melalui kolaborasi Vibe Coding antara manusia dan kecerdasan buatan.*
