// --- DATABASE & STATE MANAGEMENT ---
const STORAGE_KEY = 'expense-tracker-data';
const BUDGET_KEY = 'expense-tracker-budget';
const BALANCE_KEY = 'expense-tracker-balance';

// --- SUPABASE CLIENT ---
const SUPABASE_URL = 'https://allrxtxgsdbrmotkogeq.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFsbHJ4dHhnc2Ricm1vdGtvZ2VxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA5MDYwOTIsImV4cCI6MjA5NjQ4MjA5Mn0.9WIHNZaLTC01PwdtYAhk7JIgphGFu5dYRBoTJKbERFY';

let supabaseClient;
try {
  supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
} catch (e) {
  console.error('[Supabase] Gagal inisialisasi client:', e);
}

// Active user ID â€” set after successful login, null when logged out
let currentUserId = null;

// --- AUTH HELPERS ---

let _authTab = 'login'; // 'login' | 'register'

function authSwitchTab(tab) {
  _authTab = tab;
  const loginBtn = document.getElementById('auth-tab-login');
  const registerBtn = document.getElementById('auth-tab-register');
  const submitBtn = document.getElementById('auth-submit-btn');
  if (tab === 'login') {
    loginBtn.className = 'btn btn-primary';
    registerBtn.className = 'btn btn-outline';
    if (submitBtn) submitBtn.textContent = 'Masuk';
  } else {
    loginBtn.className = 'btn btn-outline';
    registerBtn.className = 'btn btn-primary';
    if (submitBtn) submitBtn.textContent = 'Daftar';
  }
  const errorEl = document.getElementById('auth-error');
  if (errorEl) errorEl.textContent = '';
}

async function handleAuthSubmit() {
  const email = document.getElementById('auth-email').value.trim();
  const password = document.getElementById('auth-password').value;
  const errorEl = document.getElementById('auth-error');
  const submitBtn = document.getElementById('auth-submit-btn');

  if (errorEl) errorEl.textContent = '';
  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.textContent = _authTab === 'login' ? 'Memproses...' : 'Mendaftar...';
  }

  let result;
  if (_authTab === 'login') {
    result = await supabaseClient.auth.signInWithPassword({ email, password });
  } else {
    result = await supabaseClient.auth.signUp({ email, password });
  }

  if (submitBtn) {
    submitBtn.disabled = false;
    submitBtn.textContent = _authTab === 'login' ? 'Masuk' : 'Daftar';
  }

  if (result.error) {
    if (errorEl) errorEl.textContent = result.error.message;
    return;
  }

  // signUp with email confirmation required â€” session is null until confirmed
  if (_authTab === 'register' && !result.data.session) {
    if (errorEl) {
      errorEl.style.color = '#27ae60';
      errorEl.textContent = 'Akun dibuat! Cek email untuk konfirmasi, lalu masuk.';
    }
    return;
  }

  // Success â€” onAuthStateChange (added in Task 12) will handle the rest
}

async function handleLogout() {
  await supabaseClient.auth.signOut();
  currentUserId = null;
  showAuthScreen();
}

function showAuthScreen() {
  const authScreen = document.getElementById('auth-screen');
  const appContainer = document.querySelector('.app-container');
  if (authScreen) authScreen.style.display = 'flex';
  if (appContainer) appContainer.style.display = 'none';
}

function hideAuthScreen() {
  const authScreen = document.getElementById('auth-screen');
  const appContainer = document.querySelector('.app-container');
  if (authScreen) authScreen.style.display = 'none';
  if (appContainer) appContainer.style.display = '';
}

// State variables for year and month
let currentYear = 2026;
let currentMonth = 6; // Default to June

// Auto-detect month if the current calendar year is 2026
const todayObj = new Date();
if (todayObj.getFullYear() === 2026) {
  currentMonth = todayObj.getMonth() + 1; // 1-12
}

const getActiveMonthStr = () => `${currentYear}-${String(currentMonth).padStart(2, '0')}`;

function getDefaultFormDate() {
  const today = new Date();
  if (today.getFullYear() === currentYear && (today.getMonth() + 1) === currentMonth) {
    return `${currentYear}-${String(currentMonth).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  }
  return `${currentYear}-${String(currentMonth).padStart(2, '0')}-01`;
}

const SAMPLE_DATA = [
  { date: '2026-05-12', dayName: 'Selasa', category: 'Lainnya', description: 'Parkir UIN', amount: 1000 },
  { date: '2026-05-12', dayName: 'Selasa', category: 'Makanan', description: 'Nasi Ayam', amount: 13000 },
  { date: '2026-05-12', dayName: 'Selasa', category: 'Makanan', description: 'Telor Gulung', amount: 5000 },
  { date: '2026-05-12', dayName: 'Selasa', category: 'Transportasi', description: 'Bensin Migi', amount: 22000 },
  { date: '2026-05-13', dayName: 'Rabu', category: 'Makanan', description: 'Nasi Kuning + Nasi Ayam + Warteg', amount: 41000 },
  { date: '2026-05-13', dayName: 'Rabu', category: 'Makanan', description: 'Kopi + Pulpy Orange', amount: 18000 },
  { date: '2026-05-13', dayName: 'Rabu', category: 'Makanan', description: 'C1000', amount: 8000 },
  { date: '2026-05-13', dayName: 'Rabu', category: 'Lainnya', description: 'Parkir UIN + PONRAN', amount: 7000 },
  { date: '2026-05-13', dayName: 'Rabu', category: 'Transportasi', description: 'Bensin', amount: 22000 },
  { date: '2026-05-14', dayName: 'Kamis', category: 'Makanan', description: 'Nasi Kuning', amount: 12000 },
  { date: '2026-05-14', dayName: 'Kamis', category: 'Transportasi', description: 'Bensin', amount: 15000 },
  { date: '2026-05-14', dayName: 'Kamis', category: 'Lainnya', description: 'Parkir Blok M', amount: 6000 },
  { date: '2026-05-17', dayName: 'Minggu', category: 'Makanan', description: 'Gacoan', amount: 27000 },
  { date: '2026-05-18', dayName: 'Senin', category: 'Makanan', description: 'Bubur Ayam', amount: 12000 },
  { date: '2026-05-19', dayName: 'Selasa', category: 'Transportasi', description: 'Bensin', amount: 20000 },
  { date: '2026-05-19', dayName: 'Selasa', category: 'Hiburan', description: 'Kue', amount: 32500 },
  { date: '2026-05-19', dayName: 'Selasa', category: 'Hiburan', description: 'Lukis-Lukis', amount: 6000 },
  { date: '2026-05-19', dayName: 'Selasa', category: 'Makanan', description: 'Nasi Ayam + VIT + Susu', amount: 50000 },
  { date: '2026-05-19', dayName: 'Selasa', category: 'Lainnya', description: 'Parkir', amount: 6000 },
  { date: '2026-05-20', dayName: 'Rabu', category: 'Makanan', description: 'Nasi Ayam', amount: 15000 },
  { date: '2026-05-20', dayName: 'Rabu', category: 'Transportasi', description: 'Bensin', amount: 20000 },
  { date: '2026-05-20', dayName: 'Rabu', category: 'Lainnya', description: 'Uin Kelawai', amount: 4000 },
  { date: '2026-05-20', dayName: 'Rabu', category: 'Makanan', description: 'Nasi Ayam Popcorn', amount: 20000 },
  { date: '2026-05-20', dayName: 'Rabu', category: 'Belanja', description: 'Gunting Kuku', amount: 9000 },
  { date: '2026-05-22', dayName: 'Jumat', category: 'Transportasi', description: 'Bensin', amount: 10000 },
  { date: '2026-05-22', dayName: 'Jumat', category: 'Makanan', description: 'Nasi Ayam', amount: 15000 },
  { date: '2026-05-22', dayName: 'Jumat', category: 'Lainnya', description: 'Parkir', amount: 2000 },
  { date: '2026-05-23', dayName: 'Sabtu', category: 'Makanan', description: 'Good Day', amount: 4000 },
  { date: '2026-05-24', dayName: 'Minggu', category: 'Transportasi', description: 'Bensin', amount: 20000 },
  { date: '2026-05-24', dayName: 'Minggu', category: 'Makanan', description: 'kopi dan susu, nasi ayam', amount: 27000 },
  { date: '2026-05-24', dayName: 'Minggu', category: 'Lainnya', description: 'parkir', amount: 4000 },
  { date: '2026-05-24', dayName: 'Minggu', category: 'Makanan', description: 'silverqueen', amount: 20000 },
  { date: '2026-05-25', dayName: 'Senin', category: 'Makanan', description: 'Nasi Ayam', amount: 35000 },
  { date: '2026-05-25', dayName: 'Senin', category: 'Transportasi', description: 'Bensin', amount: 10000 },
  { date: '2026-05-25', dayName: 'Senin', category: 'Lainnya', description: 'parkir', amount: 4000 },
  { date: '2026-05-26', dayName: 'Selasa', category: 'Makanan', description: 'Nasi Ayam', amount: 15000 },
  { date: '2026-05-26', dayName: 'Selasa', category: 'Transportasi', description: 'Bensin', amount: 10000 },
  { date: '2026-05-26', dayName: 'Selasa', category: 'Lainnya', description: 'Mila', amount: 50000 },
  { date: '2026-05-26', dayName: 'Selasa', category: 'Makanan', description: 'es teh', amount: 10000 },
  { date: '2026-05-31', dayName: 'Minggu', category: 'Transportasi', description: 'Bensin', amount: 20000 },
];

const DEFAULT_BUDGET = {
  month: '2026-05',
  categories: {
    Makanan: 300000,
    Transportasi: 300000,
    Belanja: 0,
    Hiburan: 100000,
    Tagihan: 0,
    Lainnya: 20000,
  },
  totalBudget: 720000,
};

const CategoryColors = {
  Makanan: '#C4705A',
  Transportasi: '#5A8FA8',
  Belanja: '#8A9B6E',
  Hiburan: '#B89B5E',
  Tagihan: '#7A6B8A',
  Lainnya: '#A8978A',
};

const CategoryLabels = ['Makanan', 'Transportasi', 'Belanja', 'Hiburan', 'Tagihan', 'Lainnya'];
const IncomeCategoryLabels = ['Gaji', 'Transfer Masuk', 'Uang Saku', 'Bonus', 'Lainnya'];

const DAY_NAMES = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
const MONTH_NAMES = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
];

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
}

async function loadExpenses() {
  try {
    const { data, error } = await supabaseClient
      .from('transactions')
      .select('*')
      .eq('user_id', currentUserId)
      .order('date', { ascending: true });

    if (error) throw error;

    // Map snake_case DB columns â†’ camelCase JS fields
    // Also ensure backward-compat fields type and source exist
    let needsMigration = false;
    const updated = (data || []).map(row => {
      const item = {
        id:             row.id,
        date:           row.date,
        dayName:        row.day_name,
        category:       row.category,
        description:    row.description,
        amount:         row.amount,
        type:           row.type,
        source:         row.source,
        transferTo:     row.transfer_to,
        incomeCategory: row.income_category,
      };
      if (!item.type)   { item.type   = 'expense'; needsMigration = true; }
      if (!item.source) { item.source = 'Dompet';  needsMigration = true; }
      return item;
    });

    if (needsMigration) await saveExpenses(updated);

    // New user with no data â€” seed with SAMPLE_DATA
    if (updated.length === 0) {
      return [];
    }

    return updated;
  } catch (e) {
    console.error('[loadExpenses]', e);
    return [];
  }
}

async function saveExpenses(expenses) {
  try {
    if (!expenses || expenses.length === 0) return;
    const rows = expenses.map(e => ({
      id:              e.id,
      user_id:         currentUserId,
      date:            e.date,
      day_name:        e.dayName        || '',
      category:        e.category       || '',
      description:     e.description    || '',
      amount:          e.amount         || 0,
      type:            e.type           || 'expense',
      source:          e.source         || 'Dompet',
      transfer_to:     e.transferTo     || null,
      income_category: e.incomeCategory || null,
    }));
    const { error } = await supabaseClient
      .from('transactions')
      .upsert(rows, { onConflict: 'id' });
    if (error) throw error;
  } catch (e) {
    console.error('[saveExpenses]', e);
  }
}

async function addExpense(entry) {
  try {
    const newEntry = { ...entry, id: generateId() };
    const row = {
      id:              newEntry.id,
      user_id:         currentUserId,
      date:            newEntry.date,
      day_name:        newEntry.dayName        || '',
      category:        newEntry.category       || '',
      description:     newEntry.description    || '',
      amount:          newEntry.amount         || 0,
      type:            newEntry.type           || 'expense',
      source:          newEntry.source         || 'Dompet',
      transfer_to:     newEntry.transferTo     || null,
      income_category: newEntry.incomeCategory || null,
    };
    const { error } = await supabaseClient.from('transactions').insert(row);
    if (error) throw error;
    return newEntry;
  } catch (e) {
    console.error('[addExpense]', e);
    return null;
  }
}

async function updateExpense(id, updates) {
  try {
    // Map camelCase JS fields â†’ snake_case DB columns
    const dbUpdates = {};
    if (updates.date            !== undefined) dbUpdates.date            = updates.date;
    if (updates.dayName         !== undefined) dbUpdates.day_name        = updates.dayName;
    if (updates.category        !== undefined) dbUpdates.category        = updates.category;
    if (updates.description     !== undefined) dbUpdates.description     = updates.description;
    if (updates.amount          !== undefined) dbUpdates.amount          = updates.amount;
    if (updates.type            !== undefined) dbUpdates.type            = updates.type;
    if (updates.source          !== undefined) dbUpdates.source          = updates.source;
    if (updates.transferTo      !== undefined) dbUpdates.transfer_to     = updates.transferTo;
    if (updates.incomeCategory  !== undefined) dbUpdates.income_category = updates.incomeCategory;

    const { data, error } = await supabaseClient
      .from('transactions')
      .update(dbUpdates)
      .eq('id', id)
      .eq('user_id', currentUserId)
      .select()
      .single();

    if (error) throw error;
    if (!data) return null;

    return {
      id:             data.id,
      date:           data.date,
      dayName:        data.day_name,
      category:       data.category,
      description:    data.description,
      amount:         data.amount,
      type:           data.type,
      source:         data.source,
      transferTo:     data.transfer_to,
      incomeCategory: data.income_category,
    };
  } catch (e) {
    console.error('[updateExpense]', e);
    return null;
  }
}

async function deleteExpense(id) {
  try {
    const { error, count } = await supabaseClient
      .from('transactions')
      .delete({ count: 'exact' })
      .eq('id', id)
      .eq('user_id', currentUserId);

    if (error) throw error;
    return count > 0;
  } catch (e) {
    console.error('[deleteExpense]', e);
    return false;
  }
}

// Balance storage and calculation helper functions
async function loadBalance() {
  try {
    const { data, error } = await supabaseClient
      .from('balances')
      .select('*')
      .eq('user_id', currentUserId)
      .maybeSingle();

    if (error) throw error;

    if (data) {
      return {
        initialDompet: data.initial_dompet,
        initialATM:    data.initial_atm,
        initialDate:   data.initial_date,
      };
    }

    // No row exists â€” create default and return it
    const defaultBalance = {
      initialDompet: 0,
      initialATM:    0,
      initialDate:   '2026-05-01',
    };
    await saveBalance(defaultBalance);
    return defaultBalance;
  } catch (e) {
    console.error('[loadBalance]', e);
    return {
      initialDompet: 0,
      initialATM:    0,
      initialDate:   '2026-05-01',
    };
  }
}

async function saveBalance(balanceData) {
  try {
    const { error } = await supabaseClient
      .from('balances')
      .upsert({
        user_id:        currentUserId,
        initial_dompet: balanceData.initialDompet,
        initial_atm:    balanceData.initialATM,
        initial_date:   balanceData.initialDate,
        updated_at:     new Date().toISOString(),
      }, { onConflict: 'user_id' });

    if (error) throw error;
  } catch (e) {
    console.error('[saveBalance]', e);
  }
}

async function calculateCurrentBalance() {
  const initial = await loadBalance();
  const expenses = await loadExpenses();

  let dompet = initial.initialDompet;
  let atm = initial.initialATM;

  expenses.forEach(e => {
    const amt = e.amount || 0;
    if (e.type === 'expense') {
      if (e.source === 'ATM') {
        atm -= amt;
      } else {
        dompet -= amt;
      }
    } else if (e.type === 'income') {
      if (e.source === 'ATM') {
        atm += amt;
      } else {
        dompet += amt;
      }
    } else if (e.type === 'transfer') {
      const from = e.source;
      const to = e.transferTo || (from === 'Dompet' ? 'ATM' : 'Dompet');
      if (from === 'Dompet' && to === 'ATM') {
        dompet -= amt;
        atm += amt;
      } else if (from === 'ATM' && to === 'Dompet') {
        atm -= amt;
        dompet += amt;
      }
    }
  });

  return { dompet, atm, total: dompet + atm };
}

async function loadBudgets() {
  try {
    const { data, error } = await supabaseClient
      .from('budgets')
      .select('*')
      .eq('user_id', currentUserId);

    if (error) throw error;

    const result = {};
    (data || []).forEach(row => {
      result[row.month] = {
        month:       row.month,
        categories:  row.categories,
        totalBudget: row.total_budget,
      };
    });
    return result;
  } catch (e) {
    console.error('[loadBudgets]', e);
    return {};
  }
}

async function loadBudget(monthStr) {
  if (!monthStr) monthStr = getActiveMonthStr();
  try {
    const { data, error } = await supabaseClient
      .from('budgets')
      .select('*')
      .eq('user_id', currentUserId)
      .eq('month', monthStr)
      .maybeSingle();

    if (error) throw error;

    if (data) {
      return {
        month:       data.month,
        categories:  data.categories,
        totalBudget: data.total_budget,
      };
    }

    // No row for this month â€” create default and return it
    const newBudget = {
      month:       monthStr,
      categories:  { ...DEFAULT_BUDGET.categories },
      totalBudget: DEFAULT_BUDGET.totalBudget,
    };
    await saveBudget(newBudget);
    return newBudget;
  } catch (e) {
    console.error('[loadBudget]', e);
    return {
      month:       monthStr,
      categories:  { ...DEFAULT_BUDGET.categories },
      totalBudget: DEFAULT_BUDGET.totalBudget,
    };
  }
}

async function saveBudget(budget) {
  try {
    const { error } = await supabaseClient
      .from('budgets')
      .upsert({
        user_id:      currentUserId,
        month:        budget.month,
        categories:   budget.categories,
        total_budget: budget.totalBudget,
      }, { onConflict: 'user_id,month' });

    if (error) throw error;
  } catch (e) {
    console.error('[saveBudget]', e);
  }
}

async function updateBudget(month, category, amount) {
  try {
    const budget = await loadBudget(month);
    budget.categories[category] = amount;
    budget.totalBudget = Object.values(budget.categories).reduce((sum, v) => sum + v, 0);
    await saveBudget(budget);
    return budget;
  } catch (e) {
    console.error('[updateBudget]', e);
    return null;
  }
}

async function getDailySummaries(year, month) {
  const expenses = await loadExpenses();
  const daysInMonth = new Date(year, month, 0).getDate();
  const summaries = [];

  for (let day = 1; day <= daysInMonth; day++) {
    const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const dateObj = new Date(year, month - 1, day);
    const dayName = DAY_NAMES[dateObj.getDay()];
    const isWeekend = dateObj.getDay() === 0 || dateObj.getDay() === 6;

    // Daily summaries for expenses only
    const dayExpenses = expenses.filter(e => e.date === dateStr && e.type === 'expense');
    const categories = {
      Makanan: 0, Transportasi: 0, Belanja: 0, Hiburan: 0, Tagihan: 0, Lainnya: 0,
    };

    dayExpenses.forEach(e => {
      if (categories[e.category] !== undefined) {
        categories[e.category] += e.amount;
      }
    });

    const total = Object.values(categories).reduce((sum, v) => sum + v, 0);

    summaries.push({
      date: dateStr,
      dayName,
      isWeekend,
      categories,
      total,
    });
  }

  return summaries;
}

async function getCategoryAnalysis(year, month) {
  const expenses = await loadExpenses();
  const monthStr = `${year}-${String(month).padStart(2, '0')}`;
  // Filter only expenses
  const monthExpenses = expenses.filter(e => e.date.startsWith(monthStr) && e.type === 'expense');
  const budget = await loadBudget(monthStr);

  const totalSpent = monthExpenses.reduce((sum, e) => sum + e.amount, 0);
  return CategoryLabels.map(cat => {
    const catExpenses = monthExpenses.filter(e => e.category === cat);
    const total = catExpenses.reduce((sum, e) => sum + e.amount, 0);
    const transactionCount = catExpenses.length;
    const percentage = totalSpent > 0 ? (total / totalSpent) * 100 : 0;
    const averagePerDay = transactionCount > 0 ? total / transactionCount : 0;
    const catBudget = budget.categories[cat] || 0;
    const variance = catBudget - total;
    const percentAchieved = catBudget > 0 ? (total / catBudget) * 100 : 0;

    return {
      category: cat,
      total,
      percentage,
      averagePerDay,
      transactionCount,
      budget: catBudget,
      actual: total,
      variance,
      percentAchieved,
    };
  });
}

function formatRupiah(amount) {
  if (amount === 0) return '-';
  if (amount < 0) return `-Rp ${Math.abs(amount).toLocaleString('id-ID')}`;
  return `Rp ${amount.toLocaleString('id-ID')}`;
}

async function getExpensesByDate(date) {
  const expenses = await loadExpenses();
  return expenses.filter(e => e.date === date);
}

async function getMonthTotal(year, month) {
  const monthStr = `${year}-${String(month).padStart(2, '0')}`;
  const expenses = await loadExpenses();
  return expenses
    .filter(e => e.date.startsWith(monthStr) && e.type === 'expense')
    .reduce((sum, e) => sum + e.amount, 0);
}

async function getMonthIncomeTotal(year, month) {
  const monthStr = `${year}-${String(month).padStart(2, '0')}`;
  const expenses = await loadExpenses();
  return expenses
    .filter(e => e.date.startsWith(monthStr) && e.type === 'income')
    .reduce((sum, e) => sum + e.amount, 0);
}

async function getActiveDaysCount(year, month) {
  const summaries = await getDailySummaries(year, month);
  return summaries.filter(s => s.total > 0).length;
}

async function getHighestSpendingDay(year, month) {
  const summaries = await getDailySummaries(year, month);
  const withExpenses = summaries.filter(s => s.total > 0);
  if (withExpenses.length === 0) return null;
  return withExpenses.reduce((max, s) => (s.total > max.total ? s : max), withExpenses[0]);
}

function getDayNameFromDate(dateStr) {
  const date = new Date(dateStr + 'T00:00:00');
  return DAY_NAMES[date.getDay()];
}

// --- ACTIVE CHARTS REGISTER ---
let activeCharts = {};
function destroyChart(id) {
  if (activeCharts[id]) {
    activeCharts[id].destroy();
    delete activeCharts[id];
  }
}

// Get Theme-Specific Chart Colors
function getChartColors() {
  const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
  return {
    text: isDark ? '#A39890' : '#6B6056',
    grid: isDark ? '#2D2724' : '#E8E4E1',
    tooltipBg: '#3D352E',
    tooltipText: '#F7F5F3',
  };
}

// --- DYNAMIC VIEW RENDERING ---
const viewContainer = document.getElementById('app-view');
const pageTitleEl = document.getElementById('page-title');

async function setView(viewName) {
  // Clear charts
  Object.keys(activeCharts).forEach(destroyChart);
  
  // Set tab active state
  document.querySelectorAll('.nav-item').forEach(item => {
    if (item.getAttribute('data-tab') === viewName) {
      item.classList.add('active');
    } else {
      item.classList.remove('active');
    }
  });

  // Render view
  let html = '';
  switch (viewName) {
    case 'dashboard':
      pageTitleEl.textContent = 'Dashboard';
      html = await viewDashboard();
      break;
    case 'input':
      pageTitleEl.textContent = 'Input Harian';
      html = viewInputHarian();
      break;
    case 'rekap':
      pageTitleEl.textContent = 'Rekap Harian';
      html = await viewRekapHarian();
      break;
    case 'analisis':
      pageTitleEl.textContent = 'Analisis Kategori';
      html = await viewAnalisisKategori();
      break;
    case 'visualisasi':
      pageTitleEl.textContent = 'Visualisasi';
      html = await viewVisualisasi();
      break;
    case 'pengaturan':
      pageTitleEl.textContent = 'Pengaturan';
      html = await viewPengaturan();
      break;
    default:
      pageTitleEl.textContent = 'Dashboard';
      html = await viewDashboard();
  }

  viewContainer.innerHTML = `<div class="view-container">${html}</div>`;
  lucide.createIcons();

  // Trigger post-render callbacks
  if (viewName === 'dashboard')        await postRenderDashboard();
  else if (viewName === 'input')       await postRenderInputHarian();
  else if (viewName === 'rekap')       await postRenderRekapHarian();
  else if (viewName === 'visualisasi') await postRenderVisualisasi();
  else if (viewName === 'pengaturan')  await postRenderPengaturan();
}

async function getDailyIncomeSummaries(year, month) {
  const expenses = await loadExpenses();
  const daysInMonth = new Date(year, month, 0).getDate();
  const summaries = [];

  for (let day = 1; day <= daysInMonth; day++) {
    const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const dateObj = new Date(year, month - 1, day);
    const dayName = DAY_NAMES[dateObj.getDay()];
    const isWeekend = dateObj.getDay() === 0 || dateObj.getDay() === 6;

    const dayIncome = expenses.filter(e => e.date === dateStr && e.type === 'income');
    const total = dayIncome.reduce((sum, e) => sum + e.amount, 0);

    summaries.push({
      date: dateStr,
      dayName,
      isWeekend,
      total,
    });
  }

  return summaries;
}

// 1. DASHBOARD VIEW
async function viewDashboard() {
  const expenses = await loadExpenses();
  const monthTotal = await getMonthTotal(currentYear, currentMonth);
  const monthIncome = await getMonthIncomeTotal(currentYear, currentMonth);
  const activeDays = await getActiveDaysCount(currentYear, currentMonth);
  const avgPerDay = activeDays > 0 ? Math.round(monthTotal / activeDays) : 0;
  const highestDay = await getHighestSpendingDay(currentYear, currentMonth);

  const balance = await calculateCurrentBalance();

  const monthStr = `${currentYear}-${String(currentMonth).padStart(2, '0')}`;
  const monthAllTransactions = expenses.filter(e => e.date.startsWith(monthStr));
  // Sort by date descending, then id descending
  monthAllTransactions.sort((a, b) => b.date.localeCompare(a.date) || b.id.localeCompare(a.id));
  const slicedRecent = monthAllTransactions.slice(0, 5);

  let recentHtml = '';
  if (slicedRecent.length === 0) {
    recentHtml = `<p class="tx-meta" style="text-align: center; padding: 24px 0;">Belum ada transaksi</p>`;
  } else {
    recentHtml = slicedRecent.map(tx => {
      let typeClass = 'expense';
      let sign = '-';
      let dotClass = tx.category || 'Lainnya';
      let subtitle = '';

      if (tx.type === 'income') {
        typeClass = 'income';
        sign = '+';
        dotClass = 'income-dot';
        subtitle = `${tx.incomeCategory || 'Pemasukan'} • Ke ${tx.source}`;
      } else if (tx.type === 'transfer') {
        typeClass = 'transfer';
        sign = '';
        dotClass = 'transfer-dot';
        const to = tx.transferTo || (tx.source === 'Dompet' ? 'ATM' : 'Dompet');
        subtitle = `Transfer • ${tx.source} â†’ ${to}`;
      } else {
        subtitle = `${tx.category || 'Lainnya'} • Dari ${tx.source}`;
      }

      return `
        <div class="tx-row" style="padding: 10px 12px; border-radius: var(--radius-sm);">
          <div class="tx-info">
            <div class="category-dot dot-${dotClass}"></div>
            <div class="tx-details">
              <p class="tx-desc" style="font-size: 13px;">${tx.description}</p>
              <p class="tx-meta">${tx.dayName}, ${parseInt(tx.date.split('-')[2])} ${MONTH_NAMES[currentMonth - 1]} • ${subtitle}</p>
            </div>
          </div>
          <span class="tx-amount ${typeClass}" style="font-size: 13px; font-weight: 600;">${sign}${formatRupiah(tx.amount)}</span>
        </div>
      `;
    }).join('');
  }

  const daysInMonth = new Date(currentYear, currentMonth, 0).getDate();

  return `
    <div class="view-header">
      <h2 class="card-title" style="font-size: 20px;">Dashboard</h2>
      <p class="view-subtitle">Ringkasan pengeluaran bulan ${MONTH_NAMES[currentMonth - 1]} ${currentYear}</p>
    </div>

    <!-- Balance Overview Cards -->
    <div class="grid-3" style="margin-bottom: 24px;">
      <div class="balance-card dompet">
        <div class="balance-card-header">
          <span class="balance-card-title">Dompet (Tunai)</span>
          <div class="balance-card-icon-box">
            <i data-lucide="wallet"></i>
          </div>
        </div>
        <p class="balance-card-value">${formatRupiah(balance.dompet)}</p>
      </div>

      <div class="balance-card atm">
        <div class="balance-card-header">
          <span class="balance-card-title">ATM (Rekening)</span>
          <div class="balance-card-icon-box">
            <i data-lucide="landmark"></i>
          </div>
        </div>
        <p class="balance-card-value">${formatRupiah(balance.atm)}</p>
      </div>

      <div class="balance-card total">
        <div class="balance-card-header">
          <span class="balance-card-title">Total Kekayaan</span>
          <div class="balance-card-icon-box">
            <i data-lucide="banknote"></i>
          </div>
        </div>
        <p class="balance-card-value">${formatRupiah(balance.total)}</p>
      </div>
    </div>

    <div class="grid-3">
      <!-- KPI: Total Pemasukan -->
      <div class="card hover-effect">
        <div class="kpi-container">
          <div>
            <p class="kpi-title">Pemasukan Bulanan</p>
            <p class="kpi-value income-text">${formatRupiah(monthIncome)}</p>
            <p class="kpi-meta">${MONTH_NAMES[currentMonth - 1]} ${currentYear}</p>
          </div>
          <div class="kpi-icon-box success">
            <i data-lucide="trending-up"></i>
          </div>
        </div>
        <div class="kpi-sparkline">
          <canvas id="sparkline-income-chart"></canvas>
        </div>
      </div>

      <!-- KPI: Total Pengeluaran -->
      <div class="card hover-effect">
        <div class="kpi-container">
          <div>
            <p class="kpi-title">Pengeluaran Bulanan</p>
            <p class="kpi-value expense">${formatRupiah(monthTotal)}</p>
            <p class="kpi-meta">${MONTH_NAMES[currentMonth - 1]} ${currentYear}</p>
          </div>
          <div class="kpi-icon-box primary">
            <i data-lucide="wallet"></i>
          </div>
        </div>
        <div class="kpi-sparkline">
          <canvas id="sparkline-chart"></canvas>
        </div>
      </div>

      <!-- KPI: Rata-rata Harian -->
      <div class="card hover-effect">
        <div class="kpi-container">
          <div>
            <p class="kpi-title">Rata-rata per Hari</p>
            <p class="kpi-value average">${formatRupiah(avgPerDay)}</p>
            <p class="kpi-meta success">
              <i data-lucide="calendar" style="width: 14px; height: 14px;"></i>
              <span>${activeDays} hari aktif dari ${daysInMonth} hari</span>
            </p>
            ${highestDay ? `
              <p class="view-subtitle" style="font-size: 11px; margin-top: 6px;">
                Tertinggi: ${highestDay.dayName}, ${parseInt(highestDay.date.split('-')[2])} ${MONTH_NAMES[currentMonth - 1]} (${formatRupiah(highestDay.total)})
              </p>
            ` : ''}
          </div>
          <div class="kpi-icon-box info-box">
            <i data-lucide="trending-down"></i>
          </div>
        </div>
      </div>
    </div>

    <!-- Daily Trend Chart -->
    <div class="card">
      <div class="card-header-flex">
        <div>
          <h3 class="card-title">Tren Pengeluaran Harian</h3>
          <p class="card-subtitle">1 - ${daysInMonth} ${MONTH_NAMES[currentMonth - 1]} ${currentYear}</p>
        </div>
      </div>
      <div class="chart-container" style="height: 260px;">
        <canvas id="dashboard-trend-chart"></canvas>
      </div>
    </div>

    <div class="grid-2">
      <!-- Donut Chart -->
      <div class="card">
        <h3 class="card-title" style="margin-bottom: 20px;">Pengeluaran per Kategori</h3>
        <div class="donut-chart-container">
          <div style="position: relative; width: 180px; height: 180px;">
            <canvas id="dashboard-donut-chart"></canvas>
            <div class="donut-inner-label">
              <p class="donut-label-title">Total</p>
              <p class="donut-label-value">${formatRupiah(monthTotal)}</p>
            </div>
          </div>
          <div class="chart-legend" id="dashboard-donut-legend">
            <!-- Populated in post render -->
          </div>
        </div>
      </div>

      <!-- Recent Transactions -->
      <div class="card">
        <h3 class="card-title" style="margin-bottom: 20px;">Transaksi Terbaru</h3>
        <div style="display: flex; flex-direction: column; gap: 8px;">
          ${recentHtml}
        </div>
      </div>
    </div>
  `;
}

async function postRenderDashboard() {
  const themeColors = getChartColors();
  
  // 1a. Sparkline Income Chart
  const dailyIncomeData = await getDailyIncomeSummaries(currentYear, currentMonth);
  const incomeChartData = dailyIncomeData.filter(d => d.total > 0);
  const last7DaysIncome = incomeChartData.slice(-7);
  const sparklineIncomeVals = last7DaysIncome.map(d => d.total);
  const sparkIncomeCtx = document.getElementById('sparkline-income-chart')?.getContext('2d');
  if (sparkIncomeCtx) {
    destroyChart('sparklineIncome');
    activeCharts['sparklineIncome'] = new Chart(sparkIncomeCtx, {
      type: 'bar',
      data: {
        labels: last7DaysIncome.map(d => parseInt(d.date.split('-')[2])),
        datasets: [{
          data: sparklineIncomeVals,
          backgroundColor: '#8A9B6E',
          borderRadius: 2,
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false }, tooltip: { enabled: false } },
        scales: {
          x: { display: false },
          y: { display: false }
        }
      }
    });
  }

  // 1b. Sparkline Expense Chart
  const dailyData = await getDailySummaries(currentYear, currentMonth);
  const chartData = dailyData.filter(d => d.total > 0);
  const last7Days = chartData.slice(-7);
  const sparklineVals = last7Days.map(d => d.total);
  const sparkCtx = document.getElementById('sparkline-chart')?.getContext('2d');
  if (sparkCtx) {
    destroyChart('sparkline');
    activeCharts['sparkline'] = new Chart(sparkCtx, {
      type: 'bar',
      data: {
        labels: last7Days.map(d => parseInt(d.date.split('-')[2])),
        datasets: [{
          data: sparklineVals,
          backgroundColor: '#C4705A',
          borderRadius: 2,
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false }, tooltip: { enabled: false } },
        scales: {
          x: { display: false },
          y: { display: false }
        }
      }
    });
  }

  // 2. Trend Bar chart
  const trendCtx = document.getElementById('dashboard-trend-chart')?.getContext('2d');
  if (trendCtx) {
    destroyChart('trend');
    
    const labels = chartData.map(d => parseInt(d.date.split('-')[2]));
    const values = chartData.map(d => d.total);
    const bgColors = chartData.map(d => d.isWeekend ? '#A85D4A' : '#C4705A');

    activeCharts['trend'] = new Chart(trendCtx, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [{
          data: values,
          backgroundColor: bgColors,
          borderRadius: 4,
          maxBarThickness: 16
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: themeColors.tooltipBg,
            titleColor: themeColors.tooltipText,
            bodyColor: themeColors.tooltipText,
            titleFont: { family: 'Inter', size: 12 },
            bodyFont: { family: 'Inter', size: 12 },
            padding: 8,
            displayColors: false,
            callbacks: {
              label: function(context) {
                return 'Total: ' + formatRupiah(context.parsed.y);
              },
              title: function(context) {
                const dayIndex = chartData[context[0].dataIndex];
                return `Tanggal ${parseInt(dayIndex.date.split('-')[2])} (${dayIndex.dayName})`;
              }
            }
          }
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: { color: themeColors.text, font: { family: 'Inter', size: 11 } }
          },
          y: {
            grid: { color: themeColors.grid },
            ticks: {
              color: themeColors.text,
              font: { family: 'Inter', size: 10 },
              callback: function(value) { return 'Rp ' + (value / 1000) + 'k'; }
            }
          }
        }
      }
    });
  }

  // 3. Donut chart
  const donutCtx = document.getElementById('dashboard-donut-chart')?.getContext('2d');
  if (donutCtx) {
    destroyChart('donut');
    const categoryData = (await getCategoryAnalysis(currentYear, currentMonth)).filter(c => c.total > 0);
    const labels = categoryData.map(c => c.category);
    const values = categoryData.map(c => c.total);
    const colors = categoryData.map(c => CategoryColors[c.category]);

    activeCharts['donut'] = new Chart(donutCtx, {
      type: 'doughnut',
      data: {
        labels: labels,
        datasets: [{
          data: values,
          backgroundColor: colors,
          borderWidth: 0,
          cutout: '72%'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: themeColors.tooltipBg,
            bodyColor: themeColors.tooltipText,
            bodyFont: { family: 'Inter', size: 12 },
            padding: 8,
            callbacks: {
              label: function(context) {
                return ` ${context.label}: ${formatRupiah(context.parsed)}`;
              }
            }
          }
        }
      }
    });

    // Populate legend
    const legendEl = document.getElementById('dashboard-donut-legend');
    if (legendEl) {
      const monthTotal = await getMonthTotal(currentYear, currentMonth);
      legendEl.innerHTML = categoryData.map(c => {
        const pct = monthTotal > 0 ? ((c.total / monthTotal) * 100).toFixed(1) : 0;
        return `
          <div class="legend-item">
            <span class="category-dot dot-${c.category}"></span>
            <span>${c.category}</span>
            <span style="font-weight: 500; opacity: 0.8;">${pct}%</span>
          </div>
        `;
      }).join('');
    }
  }
}

// 2. INPUT HARIAN VIEW
let deleteTargetId = null;

function viewInputHarian() {
  const daysInMonth = new Date(currentYear, currentMonth, 0).getDate();
  const minDate = `${currentYear}-${String(currentMonth).padStart(2, '0')}-01`;
  const maxDate = `${currentYear}-${String(currentMonth).padStart(2, '0')}-${String(daysInMonth).padStart(2, '0')}`;

  return `
    <div class="view-header">
      <h2 class="card-title" style="font-size: 20px;">Input Harian</h2>
      <p class="view-subtitle">Tambah dan kelola pengeluaran, pemasukan, dan transfer dana</p>
    </div>

    <div class="grid-5">
      <!-- Input Form -->
      <div>
        <div class="card" style="position: sticky; top: 80px;">
          <!-- Segmented Transaction Type Toggle -->
          <div class="tx-type-toggle">
            <button type="button" class="type-btn active expense" id="type-btn-expense" data-type="expense">🔴 Pengeluaran</button>
            <button type="button" class="type-btn" id="type-btn-income" data-type="income">🟢 Pemasukan</button>
            <button type="button" class="type-btn" id="type-btn-transfer" data-type="transfer">🔄 Transfer</button>
          </div>

          <form id="expense-form" class="space-y-4" style="margin-top: 16px;">
            
            <div class="form-group">
              <label class="form-label">Tanggal</label>
              <div class="input-container">
                <i data-lucide="calendar" class="input-icon"></i>
                <input type="date" id="form-date" class="form-input has-icon" min="${minDate}" max="${maxDate}" value="${getDefaultFormDate()}">
              </div>
              <p class="form-error" id="error-date"></p>
            </div>

            <div class="form-group">
              <label class="form-label">Hari</label>
              <input type="text" id="form-day" class="form-input" readonly value="Minggu">
            </div>

            <!-- Expense Category Select -->
            <div class="form-group form-field-expense">
              <label class="form-label">Kategori</label>
              <select id="form-category" class="form-select">
                ${CategoryLabels.map(cat => `<option value="${cat}">${cat}</option>`).join('')}
              </select>
              <p class="form-error" id="error-category"></p>
            </div>

            <!-- Income Category Select -->
            <div class="form-group form-field-income" style="display: none;">
              <label class="form-label">Kategori Pemasukan</label>
              <select id="form-income-category" class="form-select">
                ${IncomeCategoryLabels.map(cat => `<option value="${cat}">${cat}</option>`).join('')}
              </select>
              <p class="form-error" id="error-income-category"></p>
            </div>

            <!-- Source / From Select -->
            <div class="form-group form-field-source">
              <label class="form-label" id="label-source">Sumber Dana</label>
              <select id="form-source" class="form-select">
                <option value="Dompet">Dompet (Tunai)</option>
                <option value="ATM">ATM (Rekening)</option>
              </select>
            </div>

            <!-- Transfer To Select -->
            <div class="form-group form-field-transfer-to" style="display: none;">
              <label class="form-label">Ke</label>
              <select id="form-transfer-to" class="form-select">
                <option value="ATM" selected>ATM (Rekening)</option>
                <option value="Dompet">Dompet (Tunai)</option>
              </select>
            </div>

            <div class="form-group">
              <label class="form-label">Keterangan</label>
              <input type="text" id="form-desc" class="form-input" placeholder="Contoh: Nasi Ayam, Gaji Bulanan, dll" maxlength="100">
            </div>

            <div class="form-group">
              <label class="form-label">Jumlah (Rp)</label>
              <div class="input-container">
                <span class="input-icon" style="font-size: 13px; font-weight: 500; font-family: monospace;">Rp</span>
                <input type="text" id="form-amount" class="form-input has-icon text-right" placeholder="0" inputmode="numeric">
              </div>
              <p class="form-error" id="error-amount"></p>
            </div>

            <button type="submit" class="btn btn-primary" style="width: 100%; height: 42px;">
              <i data-lucide="plus" style="width: 16px; height: 16px;"></i>
              Tambah Pengeluaran
            </button>
          </form>
        </div>
      </div>

      <!-- Transaction List -->
      <div>
        <div class="card" style="padding: 0; overflow: hidden;" id="transaction-list-card">
          <!-- Populated dynamically -->
        </div>
      </div>
    </div>
  `;
}

async function postRenderInputHarian() {
  const dateInput = document.getElementById('form-date');
  const dayInput = document.getElementById('form-day');
  const amountInput = document.getElementById('form-amount');
  const form = document.getElementById('expense-form');

  // Sync initial day name from date input value
  if (dateInput && dayInput && dateInput.value) {
    dayInput.value = getDayNameFromDate(dateInput.value);
  }

  // Sync day name from date input
  dateInput?.addEventListener('change', (e) => {
    if (e.target.value) {
      dayInput.value = getDayNameFromDate(e.target.value);
    }
  });

  // Numeric input formatting (only numbers)
  amountInput?.addEventListener('input', (e) => {
    e.target.value = e.target.value.replace(/\D/g, '');
  });

  // Transaction type toggle handlers
  const typeBtns = document.querySelectorAll('.type-btn');
  typeBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      typeBtns.forEach(b => {
        b.classList.remove('active', 'expense', 'income', 'transfer');
      });
      const selectedType = e.target.getAttribute('data-type');
      e.target.classList.add('active', selectedType);


      
      const fieldExpense = document.querySelector('.form-field-expense');
      const fieldIncome = document.querySelector('.form-field-income');
      const fieldTransferTo = document.querySelector('.form-field-transfer-to');
      const labelSource = document.getElementById('label-source');
      const submitBtn = form.querySelector('button[type="submit"]');
      const sourceSelect = document.getElementById('form-source');
      const transferToSelect = document.getElementById('form-transfer-to');

      if (selectedType === 'expense') {
        if (fieldExpense) fieldExpense.style.display = 'block';
        if (fieldIncome) fieldIncome.style.display = 'none';
        if (fieldTransferTo) fieldTransferTo.style.display = 'none';
        if (labelSource) labelSource.textContent = 'Sumber Dana';
        if (submitBtn) {
          submitBtn.innerHTML = '<i data-lucide="plus" style="width: 16px; height: 16px;"></i> Tambah Pengeluaran';
        }
      } else if (selectedType === 'income') {
        if (fieldExpense) fieldExpense.style.display = 'none';
        if (fieldIncome) fieldIncome.style.display = 'block';
        if (fieldTransferTo) fieldTransferTo.style.display = 'none';
        if (labelSource) labelSource.textContent = 'Simpan Ke';
        if (submitBtn) {
          submitBtn.innerHTML = '<i data-lucide="plus" style="width: 16px; height: 16px;"></i> Tambah Pemasukan';
        }
      } else if (selectedType === 'transfer') {
        if (fieldExpense) fieldExpense.style.display = 'none';
        if (fieldIncome) fieldIncome.style.display = 'none';
        if (fieldTransferTo) fieldTransferTo.style.display = 'block';
        if (labelSource) labelSource.textContent = 'Dari';
        if (submitBtn) {
          submitBtn.innerHTML = '<i data-lucide="arrow-left-right" style="width: 16px; height: 16px;"></i> Transfer Dana';
        }
        // Auto sync so they are not the same
        if (sourceSelect && transferToSelect && sourceSelect.value === transferToSelect.value) {
          transferToSelect.value = sourceSelect.value === 'Dompet' ? 'ATM' : 'Dompet';
        }
      }
      lucide.createIcons();
    });
  });

  // Transfer source/destination auto-sync
  const sourceSelect = document.getElementById('form-source');
  const transferToSelect = document.getElementById('form-transfer-to');
  sourceSelect?.addEventListener('change', (e) => {
    const activeType = document.querySelector('.type-btn.active')?.getAttribute('data-type');
    if (activeType === 'transfer' && transferToSelect) {
      transferToSelect.value = e.target.value === 'Dompet' ? 'ATM' : 'Dompet';
    }
  });
  transferToSelect?.addEventListener('change', (e) => {
    const activeType = document.querySelector('.type-btn.active')?.getAttribute('data-type');
    if (activeType === 'transfer' && sourceSelect) {
      sourceSelect.value = e.target.value === 'Dompet' ? 'ATM' : 'Dompet';
    }
  });

  // Render expenses list
  await renderExpensesList();

  // Form submit handler
  form?.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const typeVal = document.querySelector('.type-btn.active')?.getAttribute('data-type') || 'expense';
    const dateVal = dateInput.value;
    const sourceVal = document.getElementById('form-source').value;
    
    let catVal = '';
    let incomeCatVal = '';
    let transferToVal = '';
    let descVal = document.getElementById('form-desc').value.trim();

    if (typeVal === 'expense') {
      catVal = document.getElementById('form-category').value;
      if (!descVal) descVal = '-';
    } else if (typeVal === 'income') {
      incomeCatVal = document.getElementById('form-income-category').value;
      if (!descVal) descVal = '-';
    } else if (typeVal === 'transfer') {
      transferToVal = document.getElementById('form-transfer-to').value;
      if (!descVal) {
        descVal = `Transfer dari ${sourceVal} ke ${transferToVal}`;
      }
    }

    const amountValStr = amountInput.value.replace(/\D/g, '');
    const amountVal = parseInt(amountValStr);

    let hasErrors = false;

    // Reset errors
    document.getElementById('error-date').textContent = '';
    document.getElementById('error-amount').textContent = '';
    dateInput.classList.remove('error');
    amountInput.classList.remove('error');

    if (!dateVal) {
      document.getElementById('error-date').textContent = 'Tanggal wajib diisi';
      dateInput.classList.add('error');
      hasErrors = true;
    }
    if (!amountValStr || amountVal <= 0) {
      document.getElementById('error-amount').textContent = 'Jumlah wajib diisi dan lebih dari 0';
      amountInput.classList.add('error');
      hasErrors = true;
    } else if (amountVal > 99999999) {
      document.getElementById('error-amount').textContent = 'Jumlah terlalu besar';
      amountInput.classList.add('error');
      hasErrors = true;
    }

    if (hasErrors) return;

    // Save transaction
    const entry = {
      date: dateVal,
      dayName: dayInput.value,
      type: typeVal,
      source: sourceVal,
      amount: amountVal
    };

    if (typeVal === 'expense') {
      entry.category = catVal;
      entry.description = descVal;
    } else if (typeVal === 'income') {
      entry.incomeCategory = incomeCatVal;
      entry.description = descVal;
    } else if (typeVal === 'transfer') {
      entry.transferTo = transferToVal;
      entry.description = descVal;
    }

    const saved = await addExpense(entry);
    if (!saved) {
      alert('Gagal menyimpan transaksi. Coba lagi.');
      return;
    }

    // Reset inputs
    document.getElementById('form-desc').value = '';
    amountInput.value = '';
    
    await renderExpensesList();
  });
}

// Inline edit state
let inlineEditingId = null;
let inlineEditData = { category: '', description: '', amount: '' };

async function renderExpensesList() {
  const expenses = await loadExpenses();
  const container = document.getElementById('transaction-list-card');
  if (!container) return;

  const activeMonthStr = getActiveMonthStr();
  const monthExpenses = expenses.filter(e => e.date.startsWith(activeMonthStr));

  if (monthExpenses.length === 0) {
    container.innerHTML = `
      <div style="padding: 48px; text-align: center;">
        <div style="width: 56px; height: 56px; margin: 0 auto 16px; border-radius: 50%; background-color: var(--bg-base); display: flex; align-items: center; justify-content: center; color: var(--text-muted);">
          <i data-lucide="calendar" style="width: 24px; height: 24px;"></i>
        </div>
        <p style="font-weight: 500; margin-bottom: 2px;">Belum ada transaksi</p>
        <p class="view-subtitle" style="font-size: 13px;">Tambahkan transaksi harian Anda</p>
      </div>
    `;
    lucide.createIcons();
    return;
  }

  // Group by date
  const dailyData = await getDailySummaries(currentYear, currentMonth);
  const groups = [];
  const datesWithTransactions = new Set(monthExpenses.map(e => e.date));

  dailyData.forEach(summary => {
    if (datesWithTransactions.has(summary.date)) {
      const dayExpenses = monthExpenses
        .filter(e => e.date === summary.date)
        .sort((a, b) => b.id.localeCompare(a.id)); // sort newest first in UI

      groups.push({
        date: summary.date,
        dayName: summary.dayName,
        isWeekend: summary.isWeekend,
        entries: dayExpenses,
        total: summary.total
      });
    }
  });

  // Sort dates descending
  groups.sort((a, b) => b.date.localeCompare(a.date));

  let groupsHtml = groups.map(group => {
    let headerStyle = group.isWeekend ? 'background-color: rgba(196, 112, 90, 0.08); border-left: 3px solid var(--primary);' : '';
    let dayNum = parseInt(group.date.split('-')[2]);

    let entriesHtml = group.entries.map(entry => {
      // If this entry is being edited inline
      if (inlineEditingId === entry.id) {
        const selectOptions = entry.type === 'income'
          ? IncomeCategoryLabels.map(cat => `<option value="${cat}" ${inlineEditData.category === cat ? 'selected' : ''}>${cat}</option>`).join('')
          : CategoryLabels.map(cat => `<option value="${cat}" ${inlineEditData.category === cat ? 'selected' : ''}>${cat}</option>`).join('');

        const categorySelectHtml = entry.type === 'transfer'
          ? `<span style="font-size: 12px; color: var(--text-muted); padding: 0 8px;">Transfer</span>`
          : `<select id="edit-cat-${entry.id}" class="form-select" style="height: 32px; padding: 0 8px; font-size: 12px; width: 110px;">
              ${selectOptions}
             </select>`;

        return `
          <div class="tx-row" style="padding: 12px; background-color: var(--bg-hover);">
            <div class="tx-edit-form" style="display: flex; gap: 8px; align-items: center; width: 100%; justify-content: space-between; flex-wrap: wrap;">
              <div style="display: flex; gap: 6px; align-items: center; flex: 1; min-width: 200px;">
                ${categorySelectHtml}
                <input type="text" id="edit-desc-${entry.id}" class="form-input" style="height: 32px; font-size: 12px; flex: 1;" value="${inlineEditData.description}">
              </div>
              <div style="display: flex; gap: 6px; align-items: center;">
                <input type="text" id="edit-amount-${entry.id}" class="form-input text-right" style="height: 32px; font-size: 12px; font-family: monospace; width: 90px;" value="${inlineEditData.amount}">
                <div style="display: flex; gap: 4px;">
                  <button class="action-icon-btn success" onclick="saveInlineEdit('${entry.id}')" title="Save">
                    <i data-lucide="check" style="width: 14px; height: 14px;"></i>
                  </button>
                  <button class="action-icon-btn danger" onclick="cancelInlineEdit()" title="Cancel">
                    <i data-lucide="x" style="width: 14px; height: 14px;"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>
        `;
      }

      // Normal row
      let typeClass = 'expense';
      let sign = '-';
      let dotClass = entry.category || 'Lainnya';
      let detailsMeta = entry.category;

      if (entry.type === 'income') {
        typeClass = 'income';
        sign = '+';
        dotClass = 'income-dot';
        detailsMeta = `${entry.incomeCategory || 'Pemasukan'} • Ke ${entry.source}`;
      } else if (entry.type === 'transfer') {
        typeClass = 'transfer';
        sign = '';
        dotClass = 'transfer-dot';
        const to = entry.transferTo || (entry.source === 'Dompet' ? 'ATM' : 'Dompet');
        detailsMeta = `Transfer • ${entry.source} â†’ ${to}`;
      } else {
        detailsMeta = `${entry.category} • Dari ${entry.source}`;
      }

      return `
        <div class="tx-row">
          <div class="tx-info">
            <div class="category-dot dot-${dotClass}"></div>
            <div class="tx-details">
              <p class="tx-desc">${entry.description}</p>
              <p class="tx-meta">${detailsMeta}</p>
            </div>
          </div>
          <div class="tx-actions">
            <span class="tx-amount ${typeClass}">${sign}${formatRupiah(entry.amount)}</span>
            <button class="action-icon-btn" onclick="startInlineEdit('${entry.id}', '${entry.type === 'income' ? entry.incomeCategory : (entry.category || '')}', '${entry.description.replace(/'/g, "\\'")}', ${entry.amount})" title="Edit">
              <i data-lucide="pencil" style="width: 13px; height: 13px;"></i>
            </button>
            <button class="action-icon-btn danger" onclick="triggerDelete('${entry.id}')" title="Hapus">
              <i data-lucide="trash-2" style="width: 13px; height: 13px;"></i>
            </button>
          </div>
        </div>
      `;
    }).join('');

    return `
      <div style="border-bottom: 1px solid var(--border);">
        <div class="date-group-header" style="${headerStyle}">
          <div class="date-group-title">
            <span class="table-date-badge" style="background-color: var(--border);">${dayNum}</span>
            <span style="font-weight: 600; color: ${group.isWeekend ? 'var(--primary)' : 'var(--text-main)'};">${group.dayName}</span>
          </div>
          <span class="date-group-total">${formatRupiah(group.total)}</span>
        </div>
        <div>
          ${entriesHtml}
        </div>
      </div>
    `;
  }).join('');

  container.innerHTML = `<div style="display: flex; flex-direction: column;">${groupsHtml}</div>`;
  lucide.createIcons();

  // Add formatting handler to inline edit amount if active
  if (inlineEditingId) {
    const editAmountInput = document.getElementById(`edit-amount-${inlineEditingId}`);
    editAmountInput?.addEventListener('input', (e) => {
      e.target.value = e.target.value.replace(/\D/g, '');
    });
  }
}

// Inline edit actions
window.startInlineEdit = async function(id, category, description, amount) {
  inlineEditingId = id;
  inlineEditData = { category, description, amount: amount.toString() };
  await renderExpensesList();
};

window.cancelInlineEdit = async function() {
  inlineEditingId = null;
  await renderExpensesList();
};

window.saveInlineEdit = async function(id) {
  const expenses = await loadExpenses();
  const entry = expenses.find(e => e.id === id);
  if (!entry) return;

  const desc = document.getElementById(`edit-desc-${id}`).value.trim() || '-';
  const amtStr = document.getElementById(`edit-amount-${id}`).value.replace(/\D/g, '');
  const amt = parseInt(amtStr) || 0;

  if (amt <= 0) return;

  const updates = {
    description: desc,
    amount: amt
  };

  if (entry.type === 'income') {
    const catEl = document.getElementById(`edit-cat-${id}`);
    if (catEl) updates.incomeCategory = catEl.value;
  } else if (entry.type === 'expense') {
    const catEl = document.getElementById(`edit-cat-${id}`);
    if (catEl) updates.category = catEl.value;
  }

  const result = await updateExpense(id, updates);
  if (!result) {
    alert('Gagal menyimpan perubahan. Coba lagi.');
  }

  inlineEditingId = null;
  await renderExpensesList();
};

// Delete actions
const deleteModal = document.getElementById('delete-modal');
const deleteConfirmBtn = document.getElementById('delete-confirm-btn');
const deleteCancelBtn = document.getElementById('delete-cancel-btn');
const sidebarOverlay = document.getElementById('sidebar-overlay');

window.triggerDelete = function(id) {
  deleteTargetId = id;
  deleteModal.classList.add('active');
};

deleteCancelBtn?.addEventListener('click', () => {
  deleteModal.classList.remove('active');
  deleteTargetId = null;
});

deleteConfirmBtn?.addEventListener('click', async () => {
  if (deleteTargetId) {
    await deleteExpense(deleteTargetId);
    deleteModal.classList.remove('active');
    deleteTargetId = null;
    
    // Refresh page
    const currentActiveTab = document.querySelector('.nav-item.active')?.getAttribute('data-tab');
    if (currentActiveTab === 'input') {
      await renderExpensesList();
    } else {
      await setView(currentActiveTab || 'dashboard');
    }
  }
});

// 3. REKAP HARIAN VIEW
async function viewRekapHarian() {
  const dailyData = await getDailySummaries(currentYear, currentMonth);

  // Calculate totals
  const catTotals = { Makanan: 0, Transportasi: 0, Belanja: 0, Hiburan: 0, Tagihan: 0, Lainnya: 0 };
  let grandTotal = 0;

  dailyData.forEach(d => {
    CategoryLabels.forEach(cat => {
      catTotals[cat] += d.categories[cat] || 0;
    });
    grandTotal += d.total;
  });

  const activeDays = dailyData.filter(d => d.total > 0).length || 1;
  const averages = {};
  CategoryLabels.forEach(cat => {
    averages[cat] = Math.round(catTotals[cat] / activeDays);
  });
  const avgTotal = Math.round(grandTotal / activeDays);

  const tableRows = dailyData.map(row => {
    const dayNum = parseInt(row.date.split('-')[2]);
    const isWeekendClass = row.isWeekend ? 'weekend' : 'hoverable';
    const dayNameStyle = row.dayName === 'Minggu' ? 'font-weight: 600; color: var(--primary);' : '';

    const categoryCols = CategoryLabels.map(cat => {
      const val = row.categories[cat] || 0;
      return `<td style="text-align: right; font-family: monospace;">${val > 0 ? val.toLocaleString('id-ID') : '-'}</td>`;
    }).join('');

    return `
      <tr class="${isWeekendClass}">
        <td>
          <span class="table-date-badge">${dayNum}</span>
        </td>
        <td style="${dayNameStyle}">${row.dayName}</td>
        ${categoryCols}
        <td style="text-align: right; font-family: monospace; font-weight: 500;">
          ${row.total > 0 ? row.total.toLocaleString('id-ID') : '-'}
        </td>
      </tr>
    `;
  }).join('');

  return `
    <div class="view-header" style="display: flex; flex-direction: column; gap: 8px;">
      <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 12px;">
        <div>
          <h2 class="card-title" style="font-size: 20px;">Rekap Pengeluaran Harian</h2>
          <p class="view-subtitle">Ringkasan total pengeluaran per hari dan kategori (${MONTH_NAMES[currentMonth - 1]} ${currentYear})</p>
        </div>
        <div style="display: flex; gap: 8px;">
          <button class="btn btn-outline" id="export-csv-btn">
            <i data-lucide="download" style="width: 14px; height: 14px;"></i>
            Export CSV
          </button>
          <button class="btn btn-success" id="export-xlsx-btn">
            <i data-lucide="file-spreadsheet" style="width: 14px; height: 14px;"></i>
            Download Excel (.xlsx)
          </button>
        </div>
      </div>
    </div>

    <div class="table-wrapper">
      <table class="data-table" style="min-width: 760px;">
        <thead>
          <tr>
            <th style="width: 60px;">Tgl</th>
            <th style="width: 80px;">Hari</th>
            ${CategoryLabels.map(cat => `
              <th style="text-align: right; width: 100px;">
                <div style="display: inline-flex; align-items: center; gap: 4px;">
                  <span class="category-dot dot-${cat}" style="width: 6px; height: 6px;"></span>
                  <span>${cat}</span>
                </div>
              </th>
            `).join('')}
            <th style="text-align: right; width: 110px;">Total</th>
          </tr>
        </thead>
        <tbody>
          ${tableRows}
        </tbody>
        <tfoot>
          <!-- Total Row -->
          <tr class="total-row">
            <td colspan="2">TOTAL</td>
            ${CategoryLabels.map(cat => {
              const val = catTotals[cat];
              return `<td style="text-align: right; font-family: monospace;">${val > 0 ? val.toLocaleString('id-ID') : '-'}</td>`;
            }).join('')}
            <td style="text-align: right; font-family: monospace; font-size: 15px; font-weight: 700;">
              ${grandTotal.toLocaleString('id-ID')}
            </td>
          </tr>
          <!-- Average Row -->
          <tr class="avg-row">
            <td colspan="2">RATA-RATA</td>
            ${CategoryLabels.map(cat => {
              const val = averages[cat];
              return `<td style="text-align: right; font-family: monospace; font-style: italic;">${val > 0 ? val.toLocaleString('id-ID') : '-'}</td>`;
            }).join('')}
            <td style="text-align: right; font-family: monospace; font-weight: 600; font-style: italic;">
              ${avgTotal.toLocaleString('id-ID')}
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  `;
}

async function postRenderRekapHarian() {
  const exportBtn = document.getElementById('export-csv-btn');
  exportBtn?.addEventListener('click', async () => {
    exportBtn.disabled = true;
    exportBtn.innerHTML = 'Mengekspor...';

    const dailyData = await getDailySummaries(currentYear, currentMonth);

    const catTotals = { Makanan: 0, Transportasi: 0, Belanja: 0, Hiburan: 0, Tagihan: 0, Lainnya: 0 };
    let grandTotal = 0;

    dailyData.forEach(d => {
      CategoryLabels.forEach(cat => {
        catTotals[cat] += d.categories[cat] || 0;
      });
      grandTotal += d.total;
    });

    const activeDays = dailyData.filter(d => d.total > 0).length || 1;
    const averages = {};
    CategoryLabels.forEach(cat => {
      averages[cat] = Math.round(catTotals[cat] / activeDays);
    });
    const avgTotal = Math.round(grandTotal / activeDays);

    const headers = ['Tanggal', 'Hari', ...CategoryLabels, 'Total Harian'];
    const rows = dailyData.map(d => [
      parseInt(d.date.split('-')[2]),
      d.dayName,
      ...CategoryLabels.map(cat => d.categories[cat] || ''),
      d.total || ''
    ]);

    const totalRow = [
      'TOTAL', '',
      ...CategoryLabels.map(cat => catTotals[cat]),
      grandTotal
    ];

    const avgRow = [
      'RATA-RATA', '',
      ...CategoryLabels.map(cat => averages[cat]),
      avgTotal
    ];

    const csvContent = [headers, ...rows, totalRow, avgRow]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const monthNameLower = MONTH_NAMES[currentMonth - 1].toLowerCase();
    link.download = `rekap-harian-${monthNameLower}-${currentYear}.csv`;
    link.click();
    URL.revokeObjectURL(url);

    setTimeout(() => {
      exportBtn.disabled = false;
      exportBtn.innerHTML = '<i data-lucide="download" style="width: 14px; height: 14px;"></i> Export CSV';
      lucide.createIcons();
    }, 800);
  });

  const exportXlsxBtn = document.getElementById('export-xlsx-btn');
  exportXlsxBtn?.addEventListener('click', async () => {
    exportXlsxBtn.disabled = true;
    exportXlsxBtn.innerHTML = 'Mengekspor...';

    try {
      await exportToExcel(currentYear, currentMonth);
    } catch (err) {
      console.error(err);
      alert('Gagal mendownload file Excel');
    }
    exportXlsxBtn.disabled = false;
    exportXlsxBtn.innerHTML = '<i data-lucide="file-spreadsheet" style="width: 14px; height: 14px;"></i> Download Excel (.xlsx)';
    lucide.createIcons();
  });
}

// 4. ANALISIS KATEGORI VIEW
async function viewAnalisisKategori() {
  const analysis = await getCategoryAnalysis(currentYear, currentMonth);
  const monthTotal = await getMonthTotal(currentYear, currentMonth);

  const totalBudget = analysis.reduce((sum, a) => sum + a.budget, 0);
  const totalActual = monthTotal;
  const totalVariance = totalBudget - totalActual;
  const totalPercentAchieved = totalBudget > 0 ? (totalActual / totalBudget) * 100 : 0;

  // Breakdown Rows
  const breakdownRows = analysis.map(item => {
    const totalHtml = item.total > 0 ? item.total.toLocaleString('id-ID') : '-';
    const averageHtml = item.averagePerDay > 0 ? Math.round(item.averagePerDay).toLocaleString('id-ID') : '-';
    const countHtml = item.transactionCount > 0 ? item.transactionCount : '-';
    const percentBar = item.total > 0 ? `
      <div class="progress-container">
        <div class="progress-track">
          <div class="progress-bar" style="width: ${item.percentage}%; background-color: var(--cat-${item.category});"></div>
        </div>
        <span class="progress-label">${item.percentage.toFixed(1)}%</span>
      </div>
    ` : '<span class="view-subtitle">-</span>';

    return `
      <tr class="hoverable">
        <td>
          <div style="display: flex; align-items: center; gap: 8px;">
            <span class="category-dot dot-${item.category}"></span>
            <span style="font-weight: 500;">${item.category}</span>
          </div>
        </td>
        <td style="text-align: right; font-family: monospace; font-weight: 600;">${totalHtml}</td>
        <td>${percentBar}</td>
        <td style="text-align: right; font-family: monospace;">${averageHtml}</td>
        <td style="text-align: right; font-family: monospace;">${countHtml}</td>
      </tr>
    `;
  }).join('');

  // Budget Rows
  const budgetData = analysis.filter(item => item.budget > 0 || item.actual > 0);
  const budgetRows = budgetData.map(item => {
    const budgetVal = item.budget > 0 ? item.budget.toLocaleString('id-ID') : '-';
    const actualVal = item.actual > 0 ? item.actual.toLocaleString('id-ID') : '-';
    
    let varianceHtml = '';
    if (item.budget > 0) {
      const isPositive = item.variance >= 0;
      const color = isPositive ? 'var(--success)' : 'var(--primary)';
      const prefix = isPositive ? '+' : '';
      varianceHtml = `<span style="font-family: monospace; font-weight: 500; color: ${color};">${prefix}${item.variance.toLocaleString('id-ID')}</span>`;
    } else {
      varianceHtml = `<span style="font-family: monospace; color: var(--primary);">-${item.actual.toLocaleString('id-ID')}</span>`;
    }

    let progressHtml = '';
    if (item.budget > 0) {
      const isOver = item.percentAchieved > 100;
      const barColor = isOver ? 'var(--primary)' : `var(--cat-${item.category})`;
      progressHtml = `
        <div class="progress-container">
          <div class="progress-track" style="height: 10px;">
            <div class="progress-bar" style="width: ${Math.min(item.percentAchieved, 100)}%; background-color: ${barColor};"></div>
          </div>
          <span class="progress-label" style="font-weight: 600; color: ${isOver ? 'var(--primary)' : 'var(--text-light)'};">${item.percentAchieved.toFixed(1)}%</span>
          ${isOver ? `<i data-lucide="alert-circle" style="width: 14px; height: 14px; color: var(--primary); flex-shrink: 0;"></i>` : ''}
        </div>
      `;
    } else {
      progressHtml = '<span class="view-subtitle">-</span>';
    }

    return `
      <tr class="hoverable">
        <td>
          <div style="display: flex; align-items: center; gap: 8px;">
            <span class="category-dot dot-${item.category}"></span>
            <span style="font-weight: 500;">${item.category}</span>
          </div>
        </td>
        <td style="text-align: right; font-family: monospace; opacity: 0.8;">${budgetVal}</td>
        <td style="text-align: right; font-family: monospace; font-weight: 500;">${actualVal}</td>
        <td style="text-align: right;">${varianceHtml}</td>
        <td>${progressHtml}</td>
      </tr>
    `;
  }).join('');

  return `
    <div class="view-header">
      <h2 class="card-title" style="font-size: 20px;">Analisis Pengeluaran per Kategori</h2>
      <p class="view-subtitle">Breakdown pengeluaran dan perbandingan dengan budget bulan ${MONTH_NAMES[currentMonth - 1]} ${currentYear}</p>
    </div>

    <!-- Breakdown Table -->
    <div class="card" style="padding: 0; overflow: hidden; margin-bottom: 24px;">
      <div style="padding: 16px 20px; border-bottom: 1px solid var(--border);">
        <h3 class="card-title">Breakdown per Kategori</h3>
      </div>
      <div class="table-wrapper" style="border: none; border-radius: 0;">
        <table class="data-table" style="min-width: 600px;">
          <thead>
            <tr>
              <th>Kategori</th>
              <th style="text-align: right;">Total (Rp)</th>
              <th style="width: 220px;">% Dari Total</th>
              <th style="text-align: right;">Rata-rata/Trx</th>
              <th style="text-align: right;">Transaksi</th>
            </tr>
          </thead>
          <tbody>
            ${breakdownRows}
          </tbody>
          <tfoot>
            <tr style="background-color: var(--bg-base); font-weight: 600;">
              <td>TOTAL</td>
              <td style="text-align: right; font-family: monospace; font-weight: 700;">${monthTotal.toLocaleString('id-ID')}</td>
              <td style="font-size: 12px;">100%</td>
              <td style="text-align: right; font-family: monospace;">
                ${Math.round(analysis.reduce((sum, a) => sum + a.averagePerDay, 0)).toLocaleString('id-ID')}
              </td>
              <td style="text-align: right; font-family: monospace;">
                ${analysis.reduce((sum, a) => sum + a.transactionCount, 0)}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>

    <!-- Budget vs Actual Table -->
    <div class="card" style="padding: 0; overflow: hidden;">
      <div style="padding: 16px 20px; border-bottom: 1px solid var(--border);">
        <h3 class="card-title">Budget vs. Aktual</h3>
      </div>
      <div class="table-wrapper" style="border: none; border-radius: 0;">
        <table class="data-table" style="min-width: 620px;">
          <thead>
            <tr>
              <th>Kategori</th>
              <th style="text-align: right;">Budget (Rp)</th>
              <th style="text-align: right;">Aktual (Rp)</th>
              <th style="text-align: right;">Selisih (Rp)</th>
              <th style="width: 240px;">% Tercapai</th>
            </tr>
          </thead>
          <tbody>
            ${budgetRows}
          </tbody>
          <tfoot>
            <tr style="background-color: var(--bg-base); font-weight: 600;">
              <td>TOTAL</td>
              <td style="text-align: right; font-family: monospace; opacity: 0.8;">${totalBudget.toLocaleString('id-ID')}</td>
              <td style="text-align: right; font-family: monospace; font-weight: 700;">${totalActual.toLocaleString('id-ID')}</td>
              <td style="text-align: right; color: ${totalVariance >= 0 ? 'var(--success)' : 'var(--primary)'}; font-family: monospace; font-weight: 700;">
                ${totalVariance >= 0 ? '+' : ''}${totalVariance.toLocaleString('id-ID')}
              </td>
              <td>
                <div class="progress-container">
                  <div class="progress-track" style="height: 10px;">
                    <div class="progress-bar" style="width: ${Math.min(totalPercentAchieved, 100)}%; background-color: var(--success);"></div>
                  </div>
                  <span class="progress-label" style="font-weight: 700;">${totalPercentAchieved.toFixed(1)}%</span>
                </div>
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  `;
}

// 5. VISUALISASI VIEW
async function viewVisualisasi() {
  const dailyData = await getDailySummaries(currentYear, currentMonth);
  const categoryData = await getCategoryAnalysis(currentYear, currentMonth);
  const monthTotal = await getMonthTotal(currentYear, currentMonth);

  // Build calendar heatmap dynamically
  const firstDayIndex = new Date(currentYear, currentMonth - 1, 1).getDay(); // 0=Sun, 1=Mon, ..., 6=Sat
  const daysInMonth = new Date(currentYear, currentMonth, 0).getDate();
  const calendarWeeks = [];

  let currentWeek = [];
  // Empty blocks before the first day of the month
  for (let i = 0; i < firstDayIndex; i++) {
    currentWeek.push({ day: null, amount: 0, isWeekend: false });
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const dateStr = `${currentYear}-${String(currentMonth).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const summary = dailyData.find(d => d.date === dateStr);
    const dow = (firstDayIndex + day - 1) % 7;
    currentWeek.push({
      day,
      amount: summary ? summary.total : 0,
      isWeekend: dow === 0 || dow === 6
    });

    if (currentWeek.length === 7) {
      calendarWeeks.push(currentWeek);
      currentWeek = [];
    }
  }

  if (currentWeek.length > 0) {
    while (currentWeek.length < 7) {
      currentWeek.push({ day: null, amount: 0, isWeekend: false });
    }
    calendarWeeks.push(currentWeek);
  }

  const getHeatClass = (amount) => {
    if (amount === 0) return 'heat-0';
    if (amount <= 30000) return 'heat-1';
    if (amount <= 70000) return 'heat-2';
    if (amount <= 100000) return 'heat-3';
    return 'heat-4';
  };

  const dayLabels = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
  const today = new Date();

  const heatmapRows = calendarWeeks.map(week => {
    const cells = week.map(cell => {
      if (cell.day === null) {
        return `<div class="heatmap-cell empty"></div>`;
      }
      
      const heatClass = getHeatClass(cell.amount);
      const isWeekendClass = cell.isWeekend ? 'weekend' : '';
      
      const isToday = today.getFullYear() === currentYear && (today.getMonth() + 1) === currentMonth && today.getDate() === cell.day;
      const isTodayClass = isToday ? 'today-highlight' : '';

      return `
        <div class="heatmap-cell ${heatClass} ${isWeekendClass} ${isTodayClass}">
          <span class="heatmap-day-num">${cell.day}</span>
          ${cell.amount > 0 ? `<span class="heatmap-day-amount">Rp${(cell.amount / 1000).toFixed(0)}k</span>` : ''}
        </div>
      `;
    }).join('');

    return `<div style="display: grid; grid-template-columns: repeat(7, 1fr); gap: 4px;">${cells}</div>`;
  }).join('');

  return `
    <div class="view-header">
      <h2 class="card-title" style="font-size: 20px;">Visualisasi</h2>
      <p class="view-subtitle">Grafik dan visualisasi data pengeluaran</p>
    </div>

    <div class="grid-2">
      <!-- Tren Harian -->
      <div class="card">
        <h3 class="card-title">Tren Pengeluaran Harian</h3>
        <p class="card-subtitle" style="margin-bottom: 20px;">1 - ${daysInMonth} ${MONTH_NAMES[currentMonth - 1]} ${currentYear}</p>
        <div class="chart-container">
          <canvas id="vis-trend-chart"></canvas>
        </div>
      </div>

      <!-- Breakdown Kategori -->
      <div class="card">
        <h3 class="card-title" style="margin-bottom: 20px;">Breakdown per Kategori</h3>
        <div class="donut-chart-container">
          <div style="position: relative; width: 180px; height: 180px;">
            <canvas id="vis-donut-chart"></canvas>
            <div class="donut-inner-label">
              <p class="donut-label-title">Total</p>
              <p class="donut-label-value">${formatRupiah(monthTotal)}</p>
            </div>
          </div>
          <div class="chart-legend" id="vis-donut-legend"></div>
        </div>
      </div>

      <!-- Budget vs Aktual -->
      <div class="card">
        <h3 class="card-title" style="margin-bottom: 20px;">Budget vs. Aktual</h3>
        <div class="chart-container">
          <canvas id="vis-budget-chart"></canvas>
        </div>
      </div>

      <!-- Kalender Pengeluaran Heatmap -->
      <div class="card">
        <h3 class="card-title" style="margin-bottom: 20px;">Kalender Pengeluaran</h3>
        <div style="display: flex; flex-direction: column; align-items: center;">
          
          <div class="heatmap-days-header">
            ${dayLabels.map(lbl => `<div>${lbl}</div>`).join('')}
          </div>

          <div class="heatmap-grid" style="display: flex; flex-direction: column; gap: 4px;">
            ${heatmapRows}
          </div>

          <!-- Heatmap Legend -->
          <div class="heatmap-legend">
            <span>Rendah</span>
            <div class="legend-scale">
              <div class="legend-box heat-0"></div>
              <div class="legend-box heat-1"></div>
              <div class="legend-box heat-2"></div>
              <div class="legend-box heat-3"></div>
              <div class="legend-box heat-4"></div>
            </div>
            <span>Tinggi</span>
          </div>

        </div>
      </div>
    </div>
  `;
}

async function postRenderVisualisasi() {
  const themeColors = getChartColors();
  const dailyData = await getDailySummaries(currentYear, currentMonth);
  const chartData = dailyData.filter(d => d.total > 0);
  const categoryData = await getCategoryAnalysis(currentYear, currentMonth);
  const monthTotal = await getMonthTotal(currentYear, currentMonth);

  // 1. Trend Bar chart
  const trendCtx = document.getElementById('vis-trend-chart')?.getContext('2d');
  if (trendCtx) {
    destroyChart('visTrend');
    
    const labels = chartData.map(d => parseInt(d.date.split('-')[2]));
    const values = chartData.map(d => d.total);
    const bgColors = chartData.map(d => d.isWeekend ? '#A85D4A' : '#C4705A');

    activeCharts['visTrend'] = new Chart(trendCtx, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [{
          data: values,
          backgroundColor: bgColors,
          borderRadius: 4,
          maxBarThickness: 16
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: themeColors.tooltipBg,
            titleColor: themeColors.tooltipText,
            bodyColor: themeColors.tooltipText,
            titleFont: { family: 'Inter', size: 12 },
            bodyFont: { family: 'Inter', size: 12 },
            padding: 8,
            displayColors: false,
            callbacks: {
              label: function(context) { return 'Total: ' + formatRupiah(context.parsed.y); },
              title: function(context) {
                const day = chartData[context[0].dataIndex];
                return `Tanggal ${parseInt(day.date.split('-')[2])} (${day.dayName})`;
              }
            }
          }
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: { color: themeColors.text, font: { family: 'Inter', size: 11 } }
          },
          y: {
            grid: { color: themeColors.grid },
            ticks: {
              color: themeColors.text,
              font: { family: 'Inter', size: 10 },
              callback: function(value) { return 'Rp ' + (value / 1000) + 'k'; }
            }
          }
        }
      }
    });
  }

  // 2. Donut chart
  const donutCtx = document.getElementById('vis-donut-chart')?.getContext('2d');
  if (donutCtx) {
    destroyChart('visDonut');
    const filteredCategories = categoryData.filter(c => c.total > 0);
    const labels = filteredCategories.map(c => c.category);
    const values = filteredCategories.map(c => c.total);
    const colors = filteredCategories.map(c => CategoryColors[c.category]);

    activeCharts['visDonut'] = new Chart(donutCtx, {
      type: 'doughnut',
      data: {
        labels: labels,
        datasets: [{
          data: values,
          backgroundColor: colors,
          borderWidth: 0,
          cutout: '72%'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: themeColors.tooltipBg,
            bodyColor: themeColors.tooltipText,
            bodyFont: { family: 'Inter', size: 12 },
            padding: 8,
            callbacks: {
              label: function(context) { return ` ${context.label}: ${formatRupiah(context.parsed)}`; }
            }
          }
        }
      }
    });

    // Populate legend
    const legendEl = document.getElementById('vis-donut-legend');
    if (legendEl) {
      legendEl.innerHTML = filteredCategories.map(c => {
        const pct = monthTotal > 0 ? ((c.total / monthTotal) * 100).toFixed(1) : 0;
        return `
          <div class="legend-item">
            <span class="category-dot dot-${c.category}"></span>
            <span>${c.category}</span>
            <span style="font-weight: 500; opacity: 0.8;">${pct}%</span>
          </div>
        `;
      }).join('');
    }
  }

  // 3. Budget vs Actual Horizontal Bar Chart
  const budgetCtx = document.getElementById('vis-budget-chart')?.getContext('2d');
  if (budgetCtx) {
    destroyChart('visBudget');
    const budgetData = categoryData.filter(c => c.budget > 0 || c.actual > 0);

    const labels = budgetData.map(c => c.category);
    const budgetVals = budgetData.map(c => c.budget);
    const actualVals = budgetData.map(c => c.actual);
    const colors = budgetData.map(c => CategoryColors[c.category]);

    activeCharts['visBudget'] = new Chart(budgetCtx, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [
          {
            label: 'Budget',
            data: budgetVals,
            backgroundColor: '#EDE9E6',
            borderRadius: 4,
            barThickness: 10
          },
          {
            label: 'Aktual',
            data: actualVals,
            backgroundColor: colors,
            borderRadius: 4,
            barThickness: 10
          }
        ]
      },
      options: {
        indexAxis: 'y',
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: themeColors.tooltipBg,
            titleColor: themeColors.tooltipText,
            bodyColor: themeColors.tooltipText,
            titleFont: { family: 'Inter', size: 12 },
            bodyFont: { family: 'Inter', size: 12 },
            padding: 8,
            callbacks: {
              label: function(context) {
                return ` ${context.dataset.label}: ${formatRupiah(context.parsed.x)}`;
              }
            }
          }
        },
        scales: {
          x: {
            grid: { color: themeColors.grid },
            ticks: {
              color: themeColors.text,
              font: { family: 'Inter', size: 10 },
              callback: function(value) { return 'Rp ' + (value / 1000) + 'k'; }
            }
          },
          y: {
            grid: { display: false },
            ticks: { color: themeColors.text, font: { family: 'Inter', size: 11 } }
          }
        }
      }
    });
  }
}

// 6. PENGATURAN VIEW
async function viewPengaturan() {
  const budget = await loadBudget(getActiveMonthStr());
  const balanceData = await loadBalance();

  const values = {};
  CategoryLabels.forEach(cat => {
    values[cat] = budget.categories[cat] || 0;
  });

  const inputsHtml = CategoryLabels.map(cat => `
    <div class="form-group" style="margin-bottom: 12px;">
      <label class="form-label" style="display: flex; align-items: center; gap: 8px;">
        <span class="category-dot dot-${cat}"></span>
        <span>${cat}</span>
      </label>
      <div class="input-container">
        <span class="input-icon" style="font-size: 13px; font-weight: 500; font-family: monospace;">Rp</span>
        <input type="text" id="budget-input-${cat}" class="form-input has-icon text-right budget-field" value="${values[cat]}" inputmode="numeric">
      </div>
    </div>
  `).join('');

  return `
    <div class="view-header">
      <h2 class="card-title" style="font-size: 20px;">Pengaturan</h2>
      <p class="view-subtitle">Atur budget bulanan, saldo awal, dan preferensi aplikasi</p>
    </div>

    <div style="max-width: 520px; display: flex; flex-direction: column; gap: 20px;">
      <!-- Saldo Awal Settings -->
      <div class="card">
        <h3 class="card-title" style="margin-bottom: 20px;">Saldo Awal</h3>
        
        <div>
          <div class="form-group" style="margin-bottom: 12px;">
            <label class="form-label" style="display: flex; align-items: center; gap: 8px;">
              <span class="category-dot dot-transfer-dot" style="background-color: var(--primary);"></span>
              <span>Saldo Dompet Awal (Tunai)</span>
            </label>
            <div class="input-container">
              <span class="input-icon" style="font-size: 13px; font-weight: 500; font-family: monospace;">Rp</span>
              <input type="text" id="initial-dompet-input" class="form-input has-icon text-right" value="${balanceData.initialDompet}" inputmode="numeric">
            </div>
          </div>

          <div class="form-group" style="margin-bottom: 12px;">
            <label class="form-label" style="display: flex; align-items: center; gap: 8px;">
              <span class="category-dot dot-transfer-dot" style="background-color: var(--success);"></span>
              <span>Saldo ATM Awal (Rekening)</span>
            </label>
            <div class="input-container">
              <span class="input-icon" style="font-size: 13px; font-weight: 500; font-family: monospace;">Rp</span>
              <input type="text" id="initial-atm-input" class="form-input has-icon text-right" value="${balanceData.initialATM}" inputmode="numeric">
            </div>
          </div>

          <div class="form-group" style="margin-bottom: 16px;">
            <label class="form-label">Tanggal Mulai Tracking</label>
            <div class="input-container">
              <i data-lucide="calendar" class="input-icon"></i>
              <input type="date" id="initial-date-input" class="form-input has-icon" value="${balanceData.initialDate}">
            </div>
          </div>

          <button class="btn btn-primary" id="save-balance-btn" style="width: 100%; height: 42px;">
            <i data-lucide="save" style="width: 16px; height: 16px;"></i>
            Simpan Saldo Awal
          </button>
        </div>
      </div>

      <!-- Budget Settings -->
      <div class="card">
        <h3 class="card-title" style="margin-bottom: 20px;">Budget Bulanan (${MONTH_NAMES[currentMonth - 1]} ${currentYear})</h3>
        
        <div>
          ${inputsHtml}

          <div style="padding: 16px 0; border-top: 1px solid var(--border); display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
            <span style="font-weight: 600; font-size: 14px;">Total Budget</span>
            <span id="budget-total-label" style="font-weight: 700; font-size: 18px; font-family: monospace;">Rp 0</span>
          </div>

          <button class="btn btn-primary" id="save-budget-btn" style="width: 100%; height: 42px;">
            <i data-lucide="save" style="width: 16px; height: 16px;"></i>
            Simpan Budget
          </button>
        </div>
      </div>

      <!-- Data Reset -->
      <div class="card">
        <h3 class="card-title" style="margin-bottom: 12px;">Manajemen Data</h3>
        <div style="display: flex; justify-content: space-between; align-items: center; gap: 16px;">
          <div>
            <p style="font-size: 14px; font-weight: 500;">Reset Data</p>
            <p class="view-subtitle" style="font-size: 12px;">Hapus semua data pengeluaran dan mulai dari awal</p>
          </div>
          <button class="btn btn-danger-outline" id="reset-data-btn">
            <i data-lucide="rotate-ccw" style="width: 14px; height: 14px;"></i>
            Reset
          </button>
        </div>
      </div>
    </div>
  `;
}

async function postRenderPengaturan() {
  const saveBtn = document.getElementById('save-budget-btn');
  const resetBtn = document.getElementById('reset-data-btn');
  const totalLabel = document.getElementById('budget-total-label');
  const fields = document.querySelectorAll('.budget-field');

  const saveBalanceBtn = document.getElementById('save-balance-btn');
  const dompetInput = document.getElementById('initial-dompet-input');
  const atmInput = document.getElementById('initial-atm-input');
  const dateInput = document.getElementById('initial-date-input');

  // Format initial balance inputs (digits only)
  dompetInput?.addEventListener('input', (e) => {
    e.target.value = e.target.value.replace(/\D/g, '');
  });
  atmInput?.addEventListener('input', (e) => {
    e.target.value = e.target.value.replace(/\D/g, '');
  });

  // Save balance handler
  saveBalanceBtn?.addEventListener('click', async () => {
    const dVal = parseInt(dompetInput.value.replace(/\D/g, '')) || 0;
    const aVal = parseInt(atmInput.value.replace(/\D/g, '')) || 0;
    const dateVal = dateInput.value || '2026-05-01';

    await saveBalance({
      initialDompet: dVal,
      initialATM: aVal,
      initialDate: dateVal
    });

    saveBalanceBtn.innerHTML = '<i data-lucide="check" style="width: 16px; height: 16px;"></i> Tersimpan!';
    saveBalanceBtn.style.backgroundColor = 'var(--success)';
    lucide.createIcons();

    setTimeout(() => {
      saveBalanceBtn.innerHTML = '<i data-lucide="save" style="width: 16px; height: 16px;"></i> Simpan Saldo Awal';
      saveBalanceBtn.style.backgroundColor = '';
      lucide.createIcons();
    }, 2000);
  });

  const calcTotal = () => {
    let sum = 0;
    fields.forEach(f => {
      const val = parseInt(f.value.replace(/\D/g, '')) || 0;
      sum += val;
    });
    totalLabel.textContent = formatRupiah(sum);
  };

  // Setup inputs
  fields.forEach(f => {
    f.addEventListener('input', (e) => {
      e.target.value = e.target.value.replace(/\D/g, '');
      calcTotal();
    });
  });

  calcTotal();

  // Save budget handler
  saveBtn?.addEventListener('click', async () => {
    const budget = await loadBudget(getActiveMonthStr());
    for (const f of fields) {
      const cat = f.id.replace('budget-input-', '');
      const amt = parseInt(f.value.replace(/\D/g, '')) || 0;
      await updateBudget(budget.month, cat, amt);
    }

    saveBtn.innerHTML = '<i data-lucide="check" style="width: 16px; height: 16px;"></i> Tersimpan!';
    saveBtn.style.backgroundColor = 'var(--success)';
    lucide.createIcons();

    setTimeout(() => {
      saveBtn.innerHTML = '<i data-lucide="save" style="width: 16px; height: 16px;"></i> Simpan Budget';
      saveBtn.style.backgroundColor = '';
      lucide.createIcons();
    }, 2000);
  });

  // Reset database handler â€” deletes all Supabase data for current user
  resetBtn?.addEventListener('click', async () => {
    if (confirm('Apakah Anda yakin ingin mereset semua data pengeluaran? Tindakan ini tidak dapat dibatalkan.')) {
      await supabaseClient.from('transactions').delete().eq('user_id', currentUserId);
      await supabaseClient.from('budgets').delete().eq('user_id', currentUserId);
      await supabaseClient.from('balances').delete().eq('user_id', currentUserId);

      await setView('dashboard');
    }
  });
}

// --- ONE-TIME MIGRATION: localStorage â†’ Supabase ---
async function runMigration() {
  const oldExpenses = localStorage.getItem(STORAGE_KEY);
  const oldBudgets  = localStorage.getItem(BUDGET_KEY);
  const oldBalance  = localStorage.getItem(BALANCE_KEY);

  if (!oldExpenses && !oldBudgets && !oldBalance) return;

  let migrationFailed = false;

  // Migrate transactions
  try {
    const { count: txCount } = await supabaseClient
      .from('transactions')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', currentUserId);

    if (oldExpenses && txCount === 0) {
      const parsed = JSON.parse(oldExpenses);
      if (Array.isArray(parsed) && parsed.length > 0) {
        const rows = parsed.map(e => ({
          id:              e.id || generateId(),
          user_id:         currentUserId,
          date:            e.date,
          day_name:        e.dayName        || '',
          category:        e.category       || '',
          description:     e.description    || '',
          amount:          e.amount         || 0,
          type:            e.type           || 'expense',
          source:          e.source         || 'Dompet',
          transfer_to:     e.transferTo     || null,
          income_category: e.incomeCategory || null,
        }));
        const { error } = await supabaseClient.from('transactions').insert(rows);
        if (error) throw error;
      }
      localStorage.removeItem(STORAGE_KEY);
    }
  } catch (e) {
    console.error('[Migration] transactions gagal:', e);
    migrationFailed = true;
  }

  // Migrate budgets
  try {
    const { count: budgetCount } = await supabaseClient
      .from('budgets')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', currentUserId);

    if (oldBudgets && budgetCount === 0) {
      const parsed = JSON.parse(oldBudgets);
      let budgetMap = parsed;
      if (parsed && parsed.categories && !parsed['2026-05']) {
        budgetMap = { [parsed.month || '2026-05']: parsed };
      }
      const rows = Object.entries(budgetMap).map(([month, b]) => ({
        user_id:      currentUserId,
        month:        month,
        categories:   b.categories,
        total_budget: b.totalBudget || 0,
      }));
      const { error } = await supabaseClient.from('budgets').insert(rows);
      if (error) throw error;
      localStorage.removeItem(BUDGET_KEY);
    }
  } catch (e) {
    console.error('[Migration] budgets gagal:', e);
    migrationFailed = true;
  }

  // Migrate balance
  try {
    const { count: balanceCount } = await supabaseClient
      .from('balances')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', currentUserId);

    if (oldBalance && balanceCount === 0) {
      const parsed = JSON.parse(oldBalance);
      const { error } = await supabaseClient.from('balances').insert({
        user_id:        currentUserId,
        initial_dompet: parsed.initialDompet || 0,
        initial_atm:    parsed.initialATM    || 0,
        initial_date:   parsed.initialDate   || '2026-05-01',
      });
      if (error) throw error;
      localStorage.removeItem(BALANCE_KEY);
    }
  } catch (e) {
    console.error('[Migration] balance gagal:', e);
    migrationFailed = true;
  }

  if (migrationFailed) {
    alert('Migrasi data lama gagal. Data Anda masih aman di browser. Silakan coba refresh halaman.');
  }
}

// --- CORE SHELL ACTIONS & NAVIGATION ---
document.addEventListener('DOMContentLoaded', async () => {
  // 1. Apply theme FIRST â€” before any await, to avoid flash
  const savedTheme = localStorage.getItem('theme') || 'light';
  document.documentElement.setAttribute('data-theme', savedTheme);

  function updateThemeIcon(theme) {
    const themeIcon = document.getElementById('theme-icon');
    if (themeIcon) {
      themeIcon.setAttribute('data-lucide', theme === 'dark' ? 'sun' : 'moon');
      lucide.createIcons();
    }
  }
  updateThemeIcon(savedTheme);

  // 2. Sidebar + mobile setup (sync â€” no storage needed)
  const sidebar = document.getElementById('sidebar');
  const collapseBtn = document.getElementById('sidebar-collapse-btn');
  const collapseIcon = document.getElementById('collapse-icon');
  let sidebarCollapsed = false;

  collapseBtn?.addEventListener('click', () => {
    sidebarCollapsed = !sidebarCollapsed;
    if (sidebarCollapsed) {
      sidebar.classList.add('collapsed');
      collapseIcon.setAttribute('data-lucide', 'chevron-right');
      collapseBtn.querySelector('.nav-text').textContent = 'Expand';
    } else {
      sidebar.classList.remove('collapsed');
      collapseIcon.setAttribute('data-lucide', 'chevron-left');
      collapseBtn.querySelector('.nav-text').textContent = 'Collapse';
    }
    lucide.createIcons();
    setTimeout(() => window.dispatchEvent(new Event('resize')), 310);
  });

  const hamburgerBtn = document.getElementById('hamburger-btn');
  hamburgerBtn?.addEventListener('click', () => {
    sidebar.classList.add('mobile-open');
    sidebarOverlay.classList.add('active');
  });
  sidebarOverlay?.addEventListener('click', () => {
    sidebar.classList.remove('mobile-open');
    sidebarOverlay.classList.remove('active');
  });

  window.addEventListener('scroll', () => {
    const header = document.getElementById('top-header');
    if (window.scrollY > 10) header?.classList.add('scrolled');
    else header?.classList.remove('scrolled');
  });

  // 3. Theme toggle (sync)
  document.getElementById('theme-toggle-btn')?.addEventListener('click', () => {
    const current = document.documentElement.getAttribute('data-theme');
    const next = current === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('theme', next);
    updateThemeIcon(next);
    const activeTab = document.querySelector('.nav-item.active')?.getAttribute('data-tab') || 'dashboard';
    setView(activeTab);
  });

  // 4. Month selector
  const monthSelector = document.getElementById('month-selector');
  if (monthSelector) {
    monthSelector.value = currentMonth;
    monthSelector.addEventListener('change', async (e) => {
      currentMonth = parseInt(e.target.value);
      const activeTab = document.querySelector('.nav-item.active')?.getAttribute('data-tab') || 'dashboard';
      await setView(activeTab);
    });
  }

  // 5. Navigation items
  document.querySelectorAll('[data-tab]').forEach(item => {
    item.addEventListener('click', async () => {
      const tab = item.getAttribute('data-tab');
      await setView(tab);
      sidebar.classList.remove('mobile-open');
      sidebarOverlay.classList.remove('active');
    });
  });

  // 6. Auth state listener â€” handles login, logout, session restore
  supabaseClient.auth.onAuthStateChange(async (event, session) => {
    if (event === 'SIGNED_IN' && session) {
      currentUserId = session.user.id;
      hideAuthScreen();
      await runMigration();
      await setView('dashboard');
    } else if (event === 'SIGNED_OUT') {
      currentUserId = null;
      showAuthScreen();
    }
  });

  // 7. Check for existing session (page refresh / returning user)
  const { data: { session } } = await supabaseClient.auth.getSession();
  if (session) {
    currentUserId = session.user.id;
    hideAuthScreen();
    await runMigration();
    await setView('dashboard');
  } else {
    showAuthScreen();
  }
});

// --- EXCEL (.XLSX) EXPORT FUNCTION ---
async function exportToExcel(year, month) {
  const daysInMonth = new Date(year, month, 0).getDate();
  const monthName = MONTH_NAMES[month - 1];
  const activeMonthStr = `${year}-${String(month).padStart(2, '0')}`;
  const categories = ["Makanan", "Transportasi", "Belanja", "Hiburan", "Tagihan", "Lainnya"];

  // 1. CREATE WORKBOOK
  const wb = XLSX.utils.book_new();

  // 2. SHEET 1: COVER
  const aoa_cover = Array.from({ length: 35 }, () => Array(10).fill(""));
  aoa_cover[1][1] = "MANAJEMEN KEUANGAN PRIBADI"; // B2
  aoa_cover[2][1] = `Laporan Keuangan Bulanan - ${monthName} 2026`; // B3
  aoa_cover[4][1] = "Catat setiap transaksi harian (pengeluaran, pemasukan, dan transfer saldo) untuk memantau saldo Dompet & ATM secara real-time."; // B5

  aoa_cover[8][1] = "Fitur Utama:"; // B9
  aoa_cover[9][1] = "âœ“ Pencatatan multi-tipe (Pengeluaran, Pemasukan, Transfer)"; // B10
  aoa_cover[10][1] = "âœ“ Pemantauan saldo Dompet & ATM secara otomatis"; // B11
  aoa_cover[11][1] = "âœ“ Rekap pengeluaran harian & analisis kategori"; // B12
  aoa_cover[12][1] = "âœ“ Laporan Arus Kas (Cash Flow) bulanan"; // B13
  aoa_cover[13][1] = "âœ“ Grafik trend pengeluaran bulanan"; // B14
  aoa_cover[14][1] = "âœ“ Perbandingan budget vs pengeluaran aktual"; // B15

  aoa_cover[17][1] = "Daftar Sheet:"; // B18
  aoa_cover[17][2] = "Deskripsi"; // C18
  aoa_cover[18][1] = "Cover"; aoa_cover[18][2] = "Halaman utama dan informasi penggunaan"; // B19, C19
  aoa_cover[19][1] = "Input Harian"; aoa_cover[19][2] = "Daftar seluruh transaksi harian (pengeluaran, pemasukan, transfer)"; // B20, C20
  aoa_cover[20][1] = "Rekap Harian"; aoa_cover[20][2] = "Ringkasan total pengeluaran harian per kategori"; // B21, C21
  aoa_cover[21][1] = "Analisis Kategori"; aoa_cover[21][2] = "Analisis budget vs pengeluaran aktual per kategori"; // B22, C22
  aoa_cover[22][1] = "Arus Kas"; aoa_cover[22][2] = "Laporan mutasi saldo Dompet & ATM"; // B23, C23
  aoa_cover[23][1] = "Grafik"; aoa_cover[23][2] = "Visualisasi data trend pengeluaran"; // B24, C24

  aoa_cover[25][1] = "Tips Penggunaan:"; // B26
  aoa_cover[26][1] = "1. Buka sheet 'Input Harian' dan catat setiap transaksi dengan tipe yang sesuai"; // B27
  aoa_cover[27][1] = "2. Atur saldo awal dan tanggal mulai tracking di sheet 'Arus Kas' jika diperlukan"; // B28
  aoa_cover[28][1] = "3. Cek sheet 'Arus Kas' untuk memantau sisa saldo Dompet dan ATM Anda"; // B29
  aoa_cover[29][1] = "4. Lihat sheet 'Analisis Kategori' untuk memantau sisa budget bulanan"; // B30

  const ws_cover = XLSX.utils.aoa_to_sheet(aoa_cover);
  ws_cover['!cols'] = [{ wch: 4 }, { wch: 65 }, { wch: 45 }];
  XLSX.utils.book_append_sheet(wb, ws_cover, "Cover");

  // 3. SHEET 2: INPUT HARIAN
  const aoa_input = [];
  const totalInputRows = 5 + daysInMonth * 5 + 2;
  for (let r = 0; r < totalInputRows; r++) {
    aoa_input.push(Array(10).fill(""));
  }

  aoa_input[1][1] = `DAFTAR TRANSAKSI HARIAN - ${monthName.toUpperCase()} ${year}`; // B2
  aoa_input[3][1] = "Tanggal"; // B4
  aoa_input[3][2] = "Hari"; // C4
  aoa_input[3][3] = "Tipe"; // D4
  aoa_input[3][4] = "Sumber"; // E4
  aoa_input[3][5] = "Kategori / Tujuan"; // F4
  aoa_input[3][6] = "Keterangan"; // G4
  aoa_input[3][7] = "Jumlah (Rp)"; // H4
  aoa_input[3][8] = "Total Pengeluaran Harian"; // I4

  const expenses = await loadExpenses();
  const monthTransactions = expenses.filter(e => e.date.startsWith(activeMonthStr));

  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    const dateObj = new Date(year, month - 1, d);
    const dayName = DAY_NAMES[dateObj.getDay()];
    
    const dayTransactions = monthTransactions.filter(e => e.date === dateStr);
    const startRow = 5 + (d - 1) * 5; // 1-based Row number in Excel
    
    aoa_input[startRow - 1][1] = d; // Column B (Tanggal)
    aoa_input[startRow - 1][2] = dayName; // Column C (Hari)
    aoa_input[startRow - 1][8] = { f: `SUMIFS(H${startRow}:H${startRow + 4}, D${startRow}:D${startRow + 4}, "Pengeluaran")` }; // Column I (Total Harian)

    for (let i = 0; i < 5; i++) {
      const txRowIndex = startRow - 1 + i;
      if (i < dayTransactions.length) {
        const tx = dayTransactions[i];
        let tipeText = "Pengeluaran";
        let kategoriText = tx.category;

        if (tx.type === "income") {
          tipeText = "Pemasukan";
          kategoriText = tx.incomeCategory;
        } else if (tx.type === "transfer") {
          tipeText = "Transfer";
          kategoriText = tx.transferTo || (tx.source === "Dompet" ? "ATM" : "Dompet");
        } else {
          if (tx.category === "Tagihan") {
            kategoriText = "Tagihan (Listrik/Air/Internet)";
          }
        }

        aoa_input[txRowIndex][3] = tipeText; // Column D (Tipe)
        aoa_input[txRowIndex][4] = tx.source; // Column E (Sumber)
        aoa_input[txRowIndex][5] = kategoriText; // Column F (Kategori/Tujuan)
        aoa_input[txRowIndex][6] = tx.description; // Column G (Keterangan)
        aoa_input[txRowIndex][7] = tx.amount; // Column H (Jumlah)
      }
    }
  }

  // Total Bulanan row
  const totalRowIdx = 4 + daysInMonth * 5;
  aoa_input[totalRowIdx][1] = "TOTAL PENGELUARAN BULANAN";
  aoa_input[totalRowIdx][7] = { f: `SUMIFS(H5:H${totalRowIdx}, D5:D${totalRowIdx}, "Pengeluaran")` };

  const ws_input = XLSX.utils.aoa_to_sheet(aoa_input);
  ws_input['!cols'] = [
    { wch: 3 },  // A
    { wch: 10 }, // B: Tanggal
    { wch: 10 }, // C: Hari
    { wch: 15 }, // D: Tipe
    { wch: 15 }, // E: Sumber
    { wch: 25 }, // F: Kategori/Tujuan
    { wch: 35 }, // G: Keterangan
    { wch: 15 }, // H: Jumlah
    { wch: 20 }  // I: Total Harian
  ];
  XLSX.utils.book_append_sheet(wb, ws_input, "Input Harian");

  // 4. SHEET 3: REKAP HARIAN
  const aoa_rekap = [];
  const totalRekapRows = 5 + daysInMonth + 3;
  for (let r = 0; r < totalRekapRows; r++) {
    aoa_rekap.push(Array(11).fill(""));
  }

  aoa_rekap[1][1] = `REKAP PENGELUARAN HARIAN - ${monthName} ${year}`; // B2
  aoa_rekap[3][1] = "Tanggal"; // B4
  aoa_rekap[3][2] = "Hari"; // C4
  aoa_rekap[3][3] = "Makanan"; // D4
  aoa_rekap[3][4] = "Transportasi"; // E4
  aoa_rekap[3][5] = "Belanja"; // F4
  aoa_rekap[3][6] = "Hiburan"; // G4
  aoa_rekap[3][7] = "Tagihan"; // H4
  aoa_rekap[3][8] = "Lainnya"; // I4
  aoa_rekap[3][9] = "Total Harian"; // J4

  const inputEndRow = 4 + daysInMonth * 5;

  for (let d = 1; d <= daysInMonth; d++) {
    const dayRowIdx = 4 + d; // Excel Row = 5 + (d - 1)
    const dateObj = new Date(year, month - 1, d);
    const dayName = DAY_NAMES[dateObj.getDay()];

    aoa_rekap[dayRowIdx - 1][1] = d; // Column B (Tanggal)
    aoa_rekap[dayRowIdx - 1][2] = dayName; // Column C (Hari)

    categories.forEach((cat, idx) => {
      const mappedCat = cat === "Tagihan" ? "Tagihan (Listrik/Air/Internet)" : cat;
      const formula = `SUMIFS('Input Harian'!$H$5:$H$${inputEndRow},'Input Harian'!$B$5:$B$${inputEndRow},B${dayRowIdx},'Input Harian'!$F$5:$F$${inputEndRow},"${mappedCat}",'Input Harian'!$D$5:$D$${inputEndRow},"Pengeluaran")`;
      aoa_rekap[dayRowIdx - 1][3 + idx] = { f: formula };
    });

    // Total Row formula: =SUM(D5:I5)
    aoa_rekap[dayRowIdx - 1][9] = { f: `SUM(D${dayRowIdx}:I${dayRowIdx})` };
  }

  // Bottom rows: TOTAL and RATA-RATA/HARI
  const totalRekapRowIdx = 4 + daysInMonth; // 0-based index
  const avgRekapRowIdx = 5 + daysInMonth;

  aoa_rekap[totalRekapRowIdx][1] = "TOTAL"; // Column B
  aoa_rekap[avgRekapRowIdx][1] = "RATA-RATA/HARI"; // Column B

  for (let idx = 0; idx < 7; idx++) {
    const colLetter = String.fromCharCode(68 + idx); // D, E, F, G, H, I, J
    aoa_rekap[totalRekapRowIdx][3 + idx] = { f: `SUM(${colLetter}5:${colLetter}${totalRekapRowIdx})` };
    aoa_rekap[avgRekapRowIdx][3 + idx] = { f: `${colLetter}${totalRekapRowIdx + 1}/${daysInMonth}` };
  }

  const ws_rekap = XLSX.utils.aoa_to_sheet(aoa_rekap);
  ws_rekap['!cols'] = [
    { wch: 3 },  // A
    { wch: 10 }, // B: Tanggal
    { wch: 10 }, // C: Hari
    { wch: 15 }, // D: Makanan
    { wch: 15 }, // E: Transportasi
    { wch: 15 }, // F: Belanja
    { wch: 15 }, // G: Hiburan
    { wch: 15 }, // H: Tagihan
    { wch: 15 }, // I: Lainnya
    { wch: 15 }  // J: Total Harian
  ];
  XLSX.utils.book_append_sheet(wb, ws_rekap, "Rekap Harian");

  // 5. SHEET 4: ANALISIS KATEGORI
  const aoa_analysis = [];
  for (let r = 0; r < 25; r++) {
    aoa_analysis.push(Array(7).fill(""));
  }

  aoa_analysis[1][1] = `ANALISIS PENGELUARAN PER KATEGORI - ${monthName.toUpperCase()} ${year}`; // B2
  aoa_analysis[3][1] = "Kategori"; // B4
  aoa_analysis[3][2] = "Total (Rp)"; // C4
  aoa_analysis[3][3] = "% dari Total"; // D4
  aoa_analysis[3][4] = "Rata-rata/Hari"; // E4
  aoa_analysis[3][5] = "Transaksi"; // F4

  const rekapTotalRow = 5 + daysInMonth; // Excel Row number of the TOTAL row in Rekap Harian sheet

  categories.forEach((cat, idx) => {
    const excelRowIdx = 5 + idx; // Excel row 5 to 10
    const mappedCatName = cat === "Tagihan" ? "Tagihan (Listrik/Air/Internet)" : cat;
    
    const rekapColLetter = String.fromCharCode(68 + idx); // D, E, F, G, H, I
    aoa_analysis[excelRowIdx - 1][1] = mappedCatName; // Column B (Kategori)
    aoa_analysis[excelRowIdx - 1][2] = { f: `'Rekap Harian'!${rekapColLetter}${rekapTotalRow}` }; // Column C (Total)
    aoa_analysis[excelRowIdx - 1][3] = { f: `IF($C$11=0,0,C${excelRowIdx}/$C$11)` }; // Column D (% dari Total)
    aoa_analysis[excelRowIdx - 1][4] = { f: `C${excelRowIdx}/${daysInMonth}` }; // Column E (Rata-rata/Hari)
    aoa_analysis[excelRowIdx - 1][5] = { f: `COUNTIFS('Input Harian'!$F$5:$F$${inputEndRow},"${mappedCatName}",'Input Harian'!$H$5:$H$${inputEndRow},">0",'Input Harian'!$D$5:$D$${inputEndRow},"Pengeluaran")` }; // Column F (Transaksi)
  });

  // TOTAL row for category analysis
  aoa_analysis[10][1] = "TOTAL"; // Column B row 11
  aoa_analysis[10][2] = { f: "SUM(C5:C10)" }; // Column C
  aoa_analysis[10][3] = "100.0%"; // Column D
  aoa_analysis[10][4] = { f: "SUM(E5:E10)" }; // Column E
  aoa_analysis[10][5] = { f: "SUM(F5:F10)" }; // Column F

  // BUDGET vs AKTUAL table
  aoa_analysis[13][1] = "BUDGET vs AKTUAL"; // B14
  aoa_analysis[14][1] = "Kategori"; // B15
  aoa_analysis[14][2] = "Budget (Rp)"; // C15
  aoa_analysis[14][3] = "Aktual (Rp)"; // D15
  aoa_analysis[14][4] = "Selisih (Rp)"; // E15
  aoa_analysis[14][5] = "% Tercapai"; // F15

  const activeBudget = await loadBudget(activeMonthStr);

  categories.forEach((cat, idx) => {
    const excelRowIdx = 16 + idx; // Excel row 16 to 21
    const mappedCatName = cat === "Tagihan" ? "Tagihan (Listrik/Air/Internet)" : cat;
    const budgetAmount = activeBudget.categories[cat] || 0;
    
    aoa_analysis[excelRowIdx - 1][1] = mappedCatName; // Column B (Kategori)
    aoa_analysis[excelRowIdx - 1][2] = budgetAmount; // Column C (Budget)
    aoa_analysis[excelRowIdx - 1][3] = { f: `C${5 + idx}` }; // Column D (Aktual, links to C5-C10 above)
    aoa_analysis[excelRowIdx - 1][4] = { f: `C${excelRowIdx}-D${excelRowIdx}` }; // Column E (Selisih)
    aoa_analysis[excelRowIdx - 1][5] = { f: `IF(C${excelRowIdx}=0,0,D${excelRowIdx}/C${excelRowIdx})` }; // Column F (% Tercapai)
  });

  // TOTAL row for BUDGET vs AKTUAL
  aoa_analysis[21][1] = "TOTAL"; // B22
  aoa_analysis[21][2] = { f: "SUM(C16:C21)" }; // Column C
  aoa_analysis[21][3] = { f: "SUM(D16:D21)" }; // Column D
  aoa_analysis[21][4] = { f: "SUM(E16:E21)" }; // Column E
  aoa_analysis[21][5] = { f: "IF(C22=0,0,D22/C22)" }; // Column F

  const ws_analysis = XLSX.utils.aoa_to_sheet(aoa_analysis);
  ws_analysis['!cols'] = [
    { wch: 3 },  // A
    { wch: 25 }, // B: Kategori
    { wch: 15 }, // C: Total/Budget
    { wch: 15 }, // D: %/Aktual
    { wch: 15 }, // E: Rata-rata/Selisih
    { wch: 15 }  // F: Transaksi/% Tercapai
  ];
  XLSX.utils.book_append_sheet(wb, ws_analysis, "Analisis Kategori");

  // 6. SHEET 5: ARUS KAS (CASH FLOW & BALANCES)
  const aoa_cashflow = [];
  for (let r = 0; r < 25; r++) {
    aoa_cashflow.push(Array(10).fill(""));
  }

  const balanceData = await loadBalance();

  aoa_cashflow[1][1] = `LAPORAN ARUS KAS & SALDO - ${monthName.toUpperCase()} ${year}`; // B2
  
  // Saldo Awal Table
  aoa_cashflow[3][1] = "1. SALDO AWAL (Mulai Tracking)"; // B4
  aoa_cashflow[4][1] = "Dompet (Tunai)"; // B5
  aoa_cashflow[4][2] = balanceData.initialDompet; // C5
  aoa_cashflow[5][1] = "ATM (Rekening)"; // B6
  aoa_cashflow[5][2] = balanceData.initialATM; // C6
  aoa_cashflow[6][1] = "TOTAL SALDO AWAL"; // B7
  aoa_cashflow[6][2] = { f: "SUM(C5:C6)" }; // C7

  // Mutasi Bulan Ini Table
  aoa_cashflow[8][1] = "2. ARUS KAS BULAN INI"; // B9
  aoa_cashflow[9][1] = "Tipe Aliran"; // B10
  aoa_cashflow[9][2] = "Dompet (Tunai)"; // C10
  aoa_cashflow[9][3] = "ATM (Rekening)"; // D10
  aoa_cashflow[9][4] = "Total Aliran"; // E10

  // Pemasukan
  aoa_cashflow[10][1] = "Total Pemasukan"; // B11
  aoa_cashflow[10][2] = { f: `SUMIFS('Input Harian'!$H$5:$H$${inputEndRow},'Input Harian'!$D$5:$D$${inputEndRow},"Pemasukan",'Input Harian'!$E$5:$E$${inputEndRow},"Dompet")` }; // C11
  aoa_cashflow[10][3] = { f: `SUMIFS('Input Harian'!$H$5:$H$${inputEndRow},'Input Harian'!$D$5:$D$${inputEndRow},"Pemasukan",'Input Harian'!$E$5:$E$${inputEndRow},"ATM")` }; // D11
  aoa_cashflow[10][4] = { f: "SUM(C11:D11)" }; // E11

  // Pengeluaran
  aoa_cashflow[11][1] = "Total Pengeluaran"; // B12
  aoa_cashflow[11][2] = { f: `SUMIFS('Input Harian'!$H$5:$H$${inputEndRow},'Input Harian'!$D$5:$D$${inputEndRow},"Pengeluaran",'Input Harian'!$E$5:$E$${inputEndRow},"Dompet")` }; // C12
  aoa_cashflow[11][3] = { f: `SUMIFS('Input Harian'!$H$5:$H$${inputEndRow},'Input Harian'!$D$5:$D$${inputEndRow},"Pengeluaran",'Input Harian'!$E$5:$E$${inputEndRow},"ATM")` }; // D12
  aoa_cashflow[11][4] = { f: "SUM(C12:D12)" }; // E12

  // Transfer Net Mutasi
  aoa_cashflow[12][1] = "Net Transfer Saldo"; // B13
  aoa_cashflow[12][2] = { f: `SUMIFS('Input Harian'!$H$5:$H$${inputEndRow},'Input Harian'!$D$5:$D$${inputEndRow},"Transfer",'Input Harian'!$E$5:$E$${inputEndRow},"ATM") - SUMIFS('Input Harian'!$H$5:$H$${inputEndRow},'Input Harian'!$D$5:$D$${inputEndRow},"Transfer",'Input Harian'!$E$5:$E$${inputEndRow},"Dompet")` }; // C13
  aoa_cashflow[12][3] = { f: `SUMIFS('Input Harian'!$H$5:$H$${inputEndRow},'Input Harian'!$D$5:$D$${inputEndRow},"Transfer",'Input Harian'!$E$5:$E$${inputEndRow},"Dompet") - SUMIFS('Input Harian'!$H$5:$H$${inputEndRow},'Input Harian'!$D$5:$D$${inputEndRow},"Transfer",'Input Harian'!$E$5:$E$${inputEndRow},"ATM")` }; // D13
  aoa_cashflow[12][4] = { f: "SUM(C13:D13)" }; // E13

  // Net Cash Flow
  aoa_cashflow[14][1] = "Net Perubahan Kas (Aliran Net)"; // B15
  aoa_cashflow[14][2] = { f: "C11-C12+C13" }; // C15
  aoa_cashflow[14][3] = { f: "D11-D12+D13" }; // D15
  aoa_cashflow[14][4] = { f: "SUM(C15:D15)" }; // E15

  // Saldo Akhir
  aoa_cashflow[16][1] = "3. SALDO AKHIR ESTIMASI"; // B17
  aoa_cashflow[17][1] = "Dompet (Tunai)"; // B18
  aoa_cashflow[17][2] = { f: "C5+C15" }; // C18
  aoa_cashflow[18][1] = "ATM (Rekening)"; // B19
  aoa_cashflow[18][2] = { f: "C6+D15" }; // C19
  aoa_cashflow[19][1] = "TOTAL SALDO AKHIR"; // B20
  aoa_cashflow[19][2] = { f: "SUM(C18:C19)" }; // C20

  const ws_cashflow = XLSX.utils.aoa_to_sheet(aoa_cashflow);
  ws_cashflow['!cols'] = [
    { wch: 3 },  // A
    { wch: 30 }, // B: Label
    { wch: 18 }, // C: Dompet
    { wch: 18 }, // D: ATM
    { wch: 18 }  // E: Total
  ];
  XLSX.utils.book_append_sheet(wb, ws_cashflow, "Arus Kas");

  // 7. SHEET 6: GRAFIK (DATA TABLE FOR CHARTS)
  const aoa_grafik = [];
  for (let r = 0; r < 35; r++) {
    aoa_grafik.push(Array(20).fill(""));
  }

  aoa_grafik[1][1] = `VISUALISASI PENGELUARAN - ${monthName.toUpperCase()} ${year}`; // B2

  aoa_grafik[3][1] = "Tanggal"; // B4
  aoa_grafik[3][2] = "Total Harian"; // C4
  for (let d = 1; d <= daysInMonth; d++) {
    const dayRowIdx = 4 + d; // Excel Row = 5 + (d - 1)
    aoa_grafik[dayRowIdx - 1][1] = d; // Column B
    aoa_grafik[dayRowIdx - 1][2] = { f: `'Rekap Harian'!J${4 + d}` }; // Column C
  }

  aoa_grafik[3][4] = "Kategori"; // E4
  aoa_grafik[3][5] = "Total"; // F4
  categories.forEach((cat, idx) => {
    const excelRowIdx = 5 + idx;
    const mappedCatName = cat === "Tagihan" ? "Tagihan (Listrik/Air/Internet)" : cat;
    aoa_grafik[excelRowIdx - 1][4] = mappedCatName; // Column E
    aoa_grafik[excelRowIdx - 1][5] = { f: `'Analisis Kategori'!C${5 + idx}` }; // Column F
  });

  const ws_grafik = XLSX.utils.aoa_to_sheet(aoa_grafik);
  ws_grafik['!cols'] = [
    { wch: 3 },  // A
    { wch: 12 }, // B: Tanggal
    { wch: 15 }, // C: Total Harian
    { wch: 5 },  // D: spacer
    { wch: 25 }, // E: Kategori
    { wch: 15 }  // F: Total
  ];
  XLSX.utils.book_append_sheet(wb, ws_grafik, "Grafik");


  expenses.forEach(e => {
    if (e.date < startOfMonthStr) {
      const amt = e.amount || 0;
      if (e.type === 'expense') {
        if (e.source === 'ATM') startATM -= amt;
        else startDompet -= amt;
      } else if (e.type === 'income') {
        if (e.source === 'ATM') startATM += amt;
        else startDompet += amt;
      } else if (e.type === 'transfer') {
        const from = e.source;
        const to = e.transferTo || (from === 'Dompet' ? 'ATM' : 'Dompet');
        if (from === 'Dompet' && to === 'ATM') {
          startDompet -= amt;
          startATM += amt;
        } else if (from === 'ATM' && to === 'Dompet') {
          startATM -= amt;
          startDompet += amt;
        }
      }
    }
  });

  const aoa_aruskas = [];
  for (let r = 0; r < 15; r++) {
    aoa_aruskas.push(Array(6).fill(""));
  }

  aoa_aruskas[1][1] = `RINGKASAN ARUS KAS - ${monthName.toUpperCase()} ${year}`; // B2
  aoa_aruskas[3][1] = "Keterangan"; // B4
  aoa_aruskas[3][2] = "Dompet (Tunai)"; // C4
  aoa_aruskas[3][3] = "ATM (Rekening)"; // D4
  aoa_aruskas[3][4] = "Total"; // E4

  // Row 5: Saldo Awal
  aoa_aruskas[4][1] = "Saldo Awal";
  aoa_aruskas[4][2] = startDompet;
  aoa_aruskas[4][3] = startATM;
  aoa_aruskas[4][4] = { f: "SUM(C5:D5)" };

  // Row 6: Total Pemasukan
  aoa_aruskas[5][1] = "Total Pemasukan";
  aoa_aruskas[5][2] = { f: `SUMIFS('Input Harian'!$H$5:$H$${inputEndRow},'Input Harian'!$D$5:$D$${inputEndRow},"Pemasukan",'Input Harian'!$E$5:$E$${inputEndRow},"Dompet")` };
  aoa_aruskas[5][3] = { f: `SUMIFS('Input Harian'!$H$5:$H$${inputEndRow},'Input Harian'!$D$5:$D$${inputEndRow},"Pemasukan",'Input Harian'!$E$5:$E$${inputEndRow},"ATM")` };
  aoa_aruskas[5][4] = { f: "SUM(C6:D6)" };

  // Row 7: Total Pengeluaran
  aoa_aruskas[6][1] = "Total Pengeluaran";
  aoa_aruskas[6][2] = { f: `SUMIFS('Input Harian'!$H$5:$H$${inputEndRow},'Input Harian'!$D$5:$D$${inputEndRow},"Pengeluaran",'Input Harian'!$E$5:$E$${inputEndRow},"Dompet")` };
  aoa_aruskas[6][3] = { f: `SUMIFS('Input Harian'!$H$5:$H$${inputEndRow},'Input Harian'!$D$5:$D$${inputEndRow},"Pengeluaran",'Input Harian'!$E$5:$E$${inputEndRow},"ATM")` };
  aoa_aruskas[6][4] = { f: "SUM(C7:D7)" };

  // Row 8: Transfer Masuk (Pindahan Ke)
  aoa_aruskas[7][1] = "Transfer Masuk (Pindahan Ke)";
  aoa_aruskas[7][2] = { f: `SUMIFS('Input Harian'!$H$5:$H$${inputEndRow},'Input Harian'!$D$5:$D$${inputEndRow},"Transfer",'Input Harian'!$E$5:$E$${inputEndRow},"ATM")` };
  aoa_aruskas[7][3] = { f: `SUMIFS('Input Harian'!$H$5:$H$${inputEndRow},'Input Harian'!$D$5:$D$${inputEndRow},"Transfer",'Input Harian'!$E$5:$E$${inputEndRow},"Dompet")` };
  aoa_aruskas[7][4] = { f: "SUM(C8:D8)" };

  // Row 9: Transfer Keluar (Pindahan Dari)
  aoa_aruskas[8][1] = "Transfer Keluar (Pindahan Dari)";
  aoa_aruskas[8][2] = { f: `SUMIFS('Input Harian'!$H$5:$H$${inputEndRow},'Input Harian'!$D$5:$D$${inputEndRow},"Transfer",'Input Harian'!$E$5:$E$${inputEndRow},"Dompet")` };
  aoa_aruskas[8][3] = { f: `SUMIFS('Input Harian'!$H$5:$H$${inputEndRow},'Input Harian'!$D$5:$D$${inputEndRow},"Transfer",'Input Harian'!$E$5:$E$${inputEndRow},"ATM")` };
  aoa_aruskas[8][4] = { f: "SUM(C9:D9)" };

  // Row 10: Saldo Akhir
  aoa_aruskas[9][1] = "Saldo Akhir";
  aoa_aruskas[9][2] = { f: "C5+C6-C7+C8-C9" };
  aoa_aruskas[9][3] = { f: "D5+D6-D7+D8-D9" };
  aoa_aruskas[9][4] = { f: "SUM(C10:D10)" };

  const ws_aruskas = XLSX.utils.aoa_to_sheet(aoa_aruskas);
  ws_aruskas['!cols'] = [
    { wch: 3 },  // A
    { wch: 30 }, // B: Keterangan
    { wch: 18 }, // C: Dompet (Tunai)
    { wch: 18 }, // D: ATM (Rekening)
    { wch: 18 }  // E: Total
  ];
  XLSX.utils.book_append_sheet(wb, ws_aruskas, "Arus Kas");

  // 8. WRITE FILE & DOWNLOAD
  XLSX.writeFile(wb, `${monthName} Tracker Managemen.xlsx`);
}





