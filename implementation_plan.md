# Menambahkan E-Wallet sebagai Sumber Dana Ketiga

Rencana ini memaparkan langkah-langkah untuk mengintegrasikan **E-Wallet** (Dompet Digital seperti GoPay, OVO, ShopeePay, dll.) sebagai sumber dana tetap ketiga di samping **Dompet** (Tunai) dan **ATM** (Rekening Bank). Pendekatan statik ini sangat aman, mudah diimplementasikan, dan tidak merusak data transaksi historis Anda.

Setelah perubahan ini diterapkan, Anda akan memiliki 4 kartu saldo: **Dompet**, **ATM**, **E-Wallet**, dan **Total Kekayaan**.

## User Review Required

> [!IMPORTANT]
> **Migrasi Skema Database Supabase**:
> Sebelum menerapkan perubahan kode di frontend, Anda perlu menambahkan kolom baru di tabel `balances` Supabase Anda.
> Silakan buka **SQL Editor** di dashboard Supabase Anda, lalu jalankan kueri SQL berikut:
> ```sql
> ALTER TABLE balances ADD COLUMN initial_ewallet NUMERIC DEFAULT 0;
> ```

## Proposed Changes

### Database & State Management

---

#### [MODIFY] [app.js](file:///c:/Users/Angga/Downloads/Tracker-Final-main/app.js)

1. **Update Pengambilan & Penyimpanan Saldo Awal (`loadBalance` & `saveBalance`)**:
   * Perbarui `loadBalance` agar mengembalikan properti `initialEWallet` dari kolom `initial_ewallet` database Supabase (nilai default `0` jika kolom kosong).
   * Perbarui `saveBalance` agar menyertakan nilai `initial_ewallet` saat melakukan upsert ke database.
   * Perbarui objek fallback `defaultBalance` di block `catch` agar menyertakan `initialEWallet: 0`.

2. **Update Logika Kalkulasi Saldo Berjalan (`calculateCurrentBalance`)**:
   * Tambahkan variabel penampung saldo berjalan: `let ewallet = initial.initialEWallet;`
   * Di dalam looping transaksi (`expenses.forEach`):
     * Jika tipe transaksi adalah `expense` dan sumbernya adalah `'E-Wallet'`, kurangi `ewallet`.
     * Jika tipe transaksi adalah `income` dan tujuannya adalah `'E-Wallet'`, tambahkan `ewallet`.
     * Jika tipe transaksi adalah `transfer`:
       * Jika asal dana (`from`) adalah `'E-Wallet'`, kurangi `ewallet`.
       * Jika tujuan dana (`to`) adalah `'E-Wallet'`, tambahkan `ewallet`.
   * Kembalikan objek saldo yang diperbarui: `{ dompet, atm, ewallet, total: dompet + atm + ewallet }`.

3. **Update UI Dashboard (`viewDashboard`)**:
   * Tambahkan kartu saldo keempat untuk **E-Wallet** di barisan saldo teratas dashboard.
   * Gunakan kelas CSS `.ewallet` untuk gradasi warna dan gunakan ikon Lucide `smartphone` atau `wallet`.

4. **Update Form Input Harian (`viewInputHarian` & `postRenderInputHarian`)**:
   * Tambahkan opsi `<option value="E-Wallet">E-Wallet (Digital)</option>` ke dalam dropdown Sumber Dana (`form-source`) dan Tujuan Transfer (`form-transfer-to`).
   * Sesuaikan logika auto-sync di `postRenderInputHarian` agar mencegah user memilih transfer dari E-Wallet ke E-Wallet (misalnya otomatis dialihkan ke ATM/Dompet).

5. **Update Pengaturan (`viewPengaturan` & `postRenderPengaturan`)**:
   * Tambahkan kolom input saldo awal baru untuk E-Wallet di card "Saldo Awal".
   * Hubungkan input field baru tersebut ke logika penyimpanan saldo awal di database.

6. **Update Ekspor Excel (`exportToExcel`)**:
   * Perbarui lembar kerja/sheet **Arus Kas** agar menghitung dan merekap aliran masuk/keluar serta saldo akhir untuk akun E-Wallet secara dinamis menggunakan formula Excel.

---

### Styling

---

#### [MODIFY] [style.css](file:///c:/Users/Angga/Downloads/Tracker-Final-main/style.css)

* Tambahkan warna gradien ungu-biru digital premium untuk kartu saldo E-Wallet di dashboard:
  ```css
  .balance-card.ewallet {
    background: linear-gradient(135deg, #7A6B8A, #5C4F6E);
  }
  ```

---

## Verification Plan

### Manual Verification
1. **SQL Migration**: Menjalankan SQL query di dashboard Supabase untuk menambahkan kolom `initial_ewallet`.
2. **Setting Saldo Awal**: Buka tab Pengaturan → Isi Saldo Awal E-Wallet Rp 200.000 → Simpan. Pastikan tersimpan dengan benar di DB.
3. **Cek Dashboard**: Buka Dashboard, pastikan ada 4 kartu saldo (Dompet, ATM, E-Wallet, dan Total Kekayaan) dan nilainya akurat.
4. **Catat Transaksi**: Tambahkan pengeluaran E-Wallet sebesar Rp 50.000 → Pastikan saldo E-Wallet di dashboard berkurang menjadi Rp 150.000.
5. **Transfer Saldo**: Lakukan transfer Rp 50.000 dari E-Wallet ke ATM → Saldo E-Wallet berkurang, saldo ATM bertambah, total kekayaan tetap stabil.
6. **Ekspor Excel**: Unduh berkas excel bulanan, periksa sheet Arus Kas apakah telah menyertakan baris/kolom perhitungan E-Wallet.
