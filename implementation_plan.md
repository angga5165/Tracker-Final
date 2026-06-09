# Implementasi Sistem Saldo Dompet & ATM + Pencatatan Pemasukan

Menambahkan pencatatan **pemasukan** dan sistem **saldo real-time** untuk Dompet (tunai) dan ATM (rekening) ke dalam expense tracker. Setiap pengeluaran akan mengurangi saldo dari sumber dana yang dipilih, dan setiap pemasukan akan menambah saldo.

## User Review Required

> [!IMPORTANT]
> **Backward Compatibility**: Data pengeluaran lama (SAMPLE_DATA bulan Mei) tidak memiliki field `type`, `source`, atau `incomeCategory`. Transaksi lama akan secara otomatis diperlakukan sebagai `type: 'expense'` dan `source: 'Dompet'` sehingga tetap muncul di semua view yang ada. Saldo awal harus diatur manual oleh user di tab Pengaturan setelah update.

> [!IMPORTANT]
> **Struktur Saldo**: Saldo disimpan secara **global** (tidak per-bulan), karena saldo bersifat kumulatif dan terus berjalan lintas bulan. Saldo dihitung secara **derivatif** dari saldo awal + semua pemasukan - semua pengeluaran sepanjang waktu. Ini mencegah data menjadi tidak konsisten.

## Open Questions

> [!IMPORTANT]
> **Kategori Pemasukan**: Apakah kategori pemasukan berikut sudah sesuai kebutuhan Anda?
> - Gaji, Transfer Masuk, Uang Saku, Bonus, Lainnya
>
> Atau ada yang mau ditambah/dikurangi?

> [!IMPORTANT]
> **Saldo Awal**: Apakah Anda ingin mengisi saldo awal Dompet dan ATM langsung di kode (hardcoded), atau cukup melalui form di tab Pengaturan saja?

## Proposed Changes

### Data Model & Storage

---

#### [MODIFY] [app.js](file:///c:/Users/Angga/Downloads/app/app.js) — Data Model

**Tambah localStorage key baru:**
```js
const BALANCE_KEY = 'expense-tracker-balance';
```

**Struktur data saldo (global, bukan per-bulan):**
```js
{
  initialDompet: 0,    // Saldo awal Dompet (diatur user)
  initialATM: 0,       // Saldo awal ATM (diatur user)
  initialDate: '2026-06-01'  // Tanggal mulai tracking
}
```

**Skema transaksi diperluas** — setiap entry di `expense-tracker-data` akan memiliki field tambahan:
```js
{
  id: 'xxx',
  date: '2026-06-05',
  dayName: 'Kamis',
  type: 'expense',           // NEW: 'expense' | 'income' | 'transfer'
  source: 'Dompet',          // NEW: 'Dompet' | 'ATM'
  category: 'Makanan',       // Tetap untuk pengeluaran
  incomeCategory: '',        // NEW: untuk pemasukan (Gaji, Transfer Masuk, dll)
  description: 'Nasi Ayam',
  amount: 15000
}
```

**Fungsi saldo baru:**
- `loadBalance()` / `saveBalance(data)`: CRUD untuk saldo awal
- `calculateCurrentBalance()`: Menghitung saldo saat ini dari saldo awal + semua income - semua expense sepanjang seluruh data
- `getBalanceBySource(source)`: Mengembalikan saldo untuk 'Dompet' atau 'ATM'

**Migrasi data lama:**
- Transaksi yang tidak memiliki field `type` akan di-set `type: 'expense'`, `source: 'Dompet'`

---

### UI Changes

---

#### [MODIFY] [app.js](file:///c:/Users/Angga/Downloads/app/app.js) — Dashboard View (`viewDashboard`)

Tambah **3 kartu saldo** di bagian atas Dashboard (sebelum KPI pengeluaran yang sudah ada):

| Kartu | Isi | Ikon | Warna |
|---|---|---|---|
| **Saldo Dompet** | Saldo real-time dompet tunai | `wallet` | `--cat-Hiburan` (emas) |
| **Saldo ATM** | Saldo real-time rekening | `landmark` (ikon bank) | `--cat-Transportasi` (biru) |
| **Total Kekayaan** | Dompet + ATM | `banknote` | `--success` (hijau) |

Ditampilkan dalam grid 3 kolom di atas grid 2 kolom KPI yang sudah ada.

Tambah juga info **Total Pemasukan** bulan ini di samping Total Pengeluaran pada KPI cards yang existing.

---

#### [MODIFY] [app.js](file:///c:/Users/Angga/Downloads/app/app.js) — Input Harian View (`viewInputHarian`)

Ubah form input dengan menambahkan:

1. **Toggle Tipe Transaksi**: 3 tombol segmented control di atas form:
   - 🔴 **Pengeluaran** (default aktif)
   - 🟢 **Pemasukan**
   - 🔄 **Transfer** (pindah dana antar Dompet ↔ ATM)

2. **Dropdown Sumber Dana**: `<select>` baru dengan opsi:
   - Dompet
   - ATM

3. **Kategori dinamis**: Saat mode Pengeluaran, tampilkan kategori yang sudah ada (Makanan, Transportasi, dll). Saat mode Pemasukan, tampilkan kategori pemasukan (Gaji, Transfer Masuk, Uang Saku, Bonus, Lainnya).

4. **Mode Transfer**: Saat dipilih, form berubah jadi:
   - Dari: [Dompet ▾] → Ke: [ATM ▾]
   - Jumlah transfer
   - Keterangan (opsional, default "Tarik Tunai" / "Setor Tunai")

5. **Label tombol submit** berubah sesuai mode:
   - "Tambah Pengeluaran" / "Tambah Pemasukan" / "Transfer Dana"

6. **Tampilan list transaksi**: Tambah ikon ▲ (hijau) untuk pemasukan dan ▼ (merah) untuk pengeluaran di sebelah jumlah. Transfer ditampilkan dengan ikon ⇄ (biru).

---

#### [MODIFY] [app.js](file:///c:/Users/Angga/Downloads/app/app.js) — Pengaturan View (`viewPengaturan`)

Tambah card **"Saldo Awal"** di atas card Budget yang sudah ada:

```
┌────────────────────────────────┐
│  Saldo Awal                    │
│                                │
│  Saldo Dompet  [Rp ________]  │
│  Saldo ATM     [Rp ________]  │
│                                │
│  Mulai Tanggal [2026-06-01]   │
│                                │
│  [💾 Simpan Saldo Awal]       │
└────────────────────────────────┘
```

---

#### [MODIFY] [style.css](file:///c:/Users/Angga/Downloads/app/style.css)

Tambah CSS baru untuk:
- **`.balance-cards-grid`**: Grid 3 kolom untuk kartu saldo (responsive → 1 kolom di mobile)
- **`.balance-card`**: Kartu saldo premium dengan gradient lembut dan efek glassmorphism
- **`.tx-type-toggle`**: Segmented control untuk toggle Pengeluaran/Pemasukan/Transfer
- **`.tx-type-toggle .active`**: State aktif dengan warna sesuai tipe
- **`.tx-amount.income`**: Warna hijau untuk pemasukan
- **`.tx-amount.expense`**: Warna merah (existing)
- **`.tx-amount.transfer`**: Warna biru untuk transfer
- **`.transfer-flow`**: Layout "Dari → Ke" untuk mode transfer

---

#### [MODIFY] [app.js](file:///c:/Users/Angga/Downloads/app/app.js) — Excel Export (`exportToExcel`)

Tambah kolom baru di sheet **Input Harian**:
- Kolom baru "Tipe" (Pengeluaran/Pemasukan/Transfer)
- Kolom baru "Sumber" (Dompet/ATM)

Tambah sheet baru **"Arus Kas"** (opsional, sheet ke-6) yang berisi ringkasan:
- Saldo Awal Dompet / ATM
- Total Pemasukan bulan ini
- Total Pengeluaran bulan ini
- Saldo Akhir Dompet / ATM

---

### Affected Existing Functions

Fungsi-fungsi berikut perlu diperbarui untuk **memfilter hanya transaksi bertipe `expense`** agar rekap pengeluaran tetap akurat:

| Fungsi | Perubahan |
|---|---|
| `getDailySummaries()` | Filter `type !== 'income'` dan `type !== 'transfer'` |
| `getCategoryAnalysis()` | Filter hanya `type === 'expense'` |
| `getMonthTotal()` | Filter hanya `type === 'expense'` |
| `getActiveDaysCount()` | Tidak berubah (sudah mereferensi daily summaries) |
| `getHighestSpendingDay()` | Tidak berubah |
| `renderExpensesList()` | Tampilkan semua tipe, tapi dengan indikator visual berbeda |

---

## Verification Plan

### Manual Verification
1. **Saldo Awal**: Buka Pengaturan → Atur saldo Dompet=Rp 500.000, ATM=Rp 2.000.000 → Simpan → Dashboard menampilkan kartu saldo dengan benar.
2. **Pemasukan**: Input Harian → Toggle ke "Pemasukan" → Tambah Gaji Rp 5.000.000 ke ATM → Saldo ATM naik ke Rp 7.000.000.
3. **Pengeluaran**: Input Harian → Toggle ke "Pengeluaran" → Tambah Nasi Ayam Rp 15.000 dari Dompet → Saldo Dompet turun ke Rp 485.000.
4. **Transfer**: Input Harian → Toggle ke "Transfer" → Transfer Rp 200.000 dari ATM ke Dompet → Saldo ATM turun, Saldo Dompet naik. Total kekayaan tidak berubah.
5. **Backward Compat**: Data Mei yang lama tetap muncul di Rekap Harian, Analisis Kategori, dan Visualisasi dengan benar.
6. **Excel Export**: Download Excel → Verifikasi sheet "Arus Kas" menampilkan saldo awal dan akhir.
