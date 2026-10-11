import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';

import { useEffect, useMemo, useState } from 'react';
import {
  getTransactions,
  createTransaction,
  updateTransaction,
  deleteTransaction,
} from './api';
import './App.css';

const BUDGET_COLORS = {
  Food: '#e8a6be',
  Transport: '#77849b',
  Shopping: '#a7b6cc',
  Entertainment: '#8cbea9',
  Bills: '#c9b5dd',
  Other: '#d5c4e4',
};

// Soft colors handed out to budget items the user creates themselves.
const EXTRA_COLORS = [
  '#f2c9a8',
  '#9fc5d8',
  '#d8b4a6',
  '#b8d4a8',
  '#e6c1e0',
  '#c4c9a0',
];

const INITIAL_BUDGETS = [
  { name: 'Food', limit: 6900 },
  { name: 'Transport', limit: 3000 },
  { name: 'Shopping', limit: 4000 },
  { name: 'Entertainment', limit: 2500 },
  { name: 'Bills', limit: 3000 },
  { name: 'Other', limit: 2500 },
];

const navigation = [
  { name: 'Overview', icon: 'overview' },
  { name: 'Transactions', icon: 'transactions' },
  { name: 'Budgets', icon: 'budgets' },
  { name: 'Reports', icon: 'reports' },
];

// Simple line icons (no extra packages needed).
const ICON_PATHS = {
  overview: (
    <>
      <rect x="3" y="3" width="7" height="7" rx="2" />
      <rect x="14" y="3" width="7" height="7" rx="2" />
      <rect x="3" y="14" width="7" height="7" rx="2" />
      <rect x="14" y="14" width="7" height="7" rx="2" />
    </>
  ),
  transactions: <path d="M8 4v16M8 4L4 8M8 4l4 4M16 20V4M16 20l-4-4M16 20l4-4" />,
  budgets: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 3v9h9" />
    </>
  ),
  reports: <path d="M5 20V10M12 20V4M19 20v-7" />,
  settings: (
    <>
      <path d="M4 7h10M18 7h2M4 17h2M10 17h10" />
      <circle cx="16" cy="7" r="2" />
      <circle cx="8" cy="17" r="2" />
    </>
  ),
  bell: <path d="M6 16V11a6 6 0 0 1 12 0v5l2 2H4l2-2zM10 20a2 2 0 0 0 4 0" />,
  income: <path d="M17 7L7 17M7 17h8M7 17V9" />,
  expense: <path d="M7 17L17 7M17 7H9M17 7v8" />,
  wallet: (
    <>
      <path d="M4 7h14a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7zM4 7l12-3v3" />
      <circle cx="16" cy="13.5" r="1" />
    </>
  ),
  food: <path d="M7 3v8M5 3v5a2 2 0 0 0 4 0V3M7 11v10M17 3c-2 2-2.5 5-2.5 8H17v10" />,
  transport: (
    <>
      <rect x="4" y="4" width="16" height="13" rx="3" />
      <path d="M4 11h16M8 17v3M16 17v3" />
    </>
  ),
  shopping: <path d="M5 8h14l-1 12H6L5 8zM9 8a3 3 0 0 1 6 0" />,
  bills: <path d="M13 2L4 14h7l-1 8 9-12h-7l1-8z" />,
  entertainment: (
    <>
      <rect x="3" y="5" width="18" height="14" rx="3" />
      <path d="M10 9.5v5l4.5-2.5z" />
    </>
  ),
  other: (
    <>
      <rect x="3" y="6" width="18" height="12" rx="3" />
      <path d="M3 10h18" />
    </>
  ),
  plus: <path d="M12 5v14M5 12h14" />,
  edit: <path d="M4 20l4-1 11-11-3-3L5 16l-1 4zM14 6l3 3" />,
  trash: <path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3" />,
  logout: <path d="M10 4H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h4M16 8l4 4-4 4M20 12H9" />,
  close: <path d="M6 6l12 12M18 6L6 18" />,
};

function Icon({ name, size = 20 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {ICON_PATHS[name] || ICON_PATHS.other}
    </svg>
  );
}

function getCategoryColor(name) {
  if (BUDGET_COLORS[name]) return BUDGET_COLORS[name];

  let hash = 0;

  for (const character of String(name)) {
    hash += character.charCodeAt(0);
  }

  return EXTRA_COLORS[hash % EXTRA_COLORS.length];
}

function getSavedUser() {
  try {
    return JSON.parse(localStorage.getItem('user') || 'null');
  } catch {
    return null;
  }
}

// Budget items are remembered in the browser, separately for each user.
function loadBudgets(storageKey) {
  try {
    const raw = localStorage.getItem(storageKey);

    if (!raw) return INITIAL_BUDGETS;

    const parsed = JSON.parse(raw);

    if (
      Array.isArray(parsed) &&
      parsed.every(
        (item) =>
          typeof item?.name === 'string' &&
          Number.isFinite(Number(item.limit)),
      )
    ) {
      return parsed.map((item) => ({
        name: item.name,
        limit: Number(item.limit),
      }));
    }
  } catch {
    // Fall back to the default budgets below.
  }

  return INITIAL_BUDGETS;
}

function formatCurrency(amount, currency = 'INR') {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

function getGreeting() {
  const hour = new Date().getHours();

  if (hour >= 5 && hour < 12) return 'Good morning';
  if (hour >= 12 && hour < 17) return 'Good afternoon';
  if (hour >= 17 && hour < 21) return 'Good evening';

  return 'Good night';
}

function getLocalDateString(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

function getMonthKey(dateString) {
  return String(dateString || '').slice(0, 7);
}

function getMonthLabel(date) {
  return date.toLocaleDateString('en-IN', {
    month: 'short',
  });
}

function getTransactionIcon(category, amount) {
  if (amount > 0) return 'income';

  const icons = {
    Food: 'food',
    Transport: 'transport',
    Shopping: 'shopping',
    Bills: 'bills',
    Entertainment: 'entertainment',
    Other: 'other',
  };

  return icons[category] || 'other';
}

function mapBackendTransaction(item) {
  const isIncome = item.type?.toLowerCase() === 'income';
  const numericAmount = Number(item.amount) || 0;

  return {
    id: item.id,
    name: item.title || 'Untitled transaction',
    category: item.category || (isIncome ? 'Income' : 'Other'),
    date: item.date,
    description: item.description || '',
    paymentMethod: item.paymentMethod || 'Cash',
    amount: isIncome ? numericAmount : -Math.abs(numericAmount),
    icon: getTransactionIcon(
      item.category,
      isIncome ? numericAmount : -numericAmount,
    ),
  };
}

function Dashboard() {
  const savedUser = getSavedUser();
  const budgetStorageKey = `expensia_budgets_${savedUser?.id ?? 'guest'}`;

  const [activePage, setActivePage] = useState('Overview');
  const [selectedPeriod, setSelectedPeriod] = useState('This month');

  // Transactions start empty. Real records are loaded from the backend.
  const [transactions, setTransactions] = useState([]);
  const [isLoadingTransactions, setIsLoadingTransactions] = useState(true);
  const [transactionError, setTransactionError] = useState('');
  const [isSavingTransaction, setIsSavingTransaction] = useState(false);

  const [budgets, setBudgets] = useState(() => loadBudgets(budgetStorageKey));

  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('All');

  const [showAddTransaction, setShowAddTransaction] = useState(false);
  const [transactionName, setTransactionName] = useState('');
  const [transactionAmount, setTransactionAmount] = useState('');
  const [transactionCategory, setTransactionCategory] = useState(
    budgets[0]?.name || 'Other',
  );
  const [transactionType, setTransactionType] = useState('Expense');
  const [editingTransactionId, setEditingTransactionId] = useState(null);

  const [budgetMessage, setBudgetMessage] = useState('');
  const [budgetError, setBudgetError] = useState('');
  const [editingBudget, setEditingBudget] = useState(null);
  const [newBudgetLimit, setNewBudgetLimit] = useState('');
  const [newBudgetName, setNewBudgetName] = useState('');
  const [newBudgetAmount, setNewBudgetAmount] = useState('');

  const [profileName, setProfileName] = useState(savedUser?.name || 'Guest');
  const [profileEmail, setProfileEmail] = useState(
    savedUser?.email || 'you@example.com',
  );
  const [currency, setCurrency] = useState('INR');

  const [greeting, setGreeting] = useState(getGreeting);

  useEffect(() => {
    let cancelled = false;

    async function loadTransactions() {
      try {
        setTransactionError('');

        const data = await getTransactions();

        if (!cancelled) {
          const formattedTransactions = data
            .map(mapBackendTransaction)
            .sort((a, b) => (b.date || '').localeCompare(a.date || ''));

          setTransactions(formattedTransactions);
        }
      } catch (error) {
        console.error('Could not load transactions:', error);

        if (!cancelled) {
          setTransactionError(
            'Could not connect to the backend. Check that Spring Boot is running on port 9090.',
          );
        }
      } finally {
        if (!cancelled) {
          setIsLoadingTransactions(false);
        }
      }
    }

    loadTransactions();

    return () => {
      cancelled = true;
    };
  }, []);

  // Remember this user's budget items in the browser.
  useEffect(() => {
    try {
      localStorage.setItem(budgetStorageKey, JSON.stringify(budgets));
    } catch {
      // Saving is optional; ignore storage errors.
    }
  }, [budgets, budgetStorageKey]);

  function money(amount) {
    return formatCurrency(amount, currency);
  }

  function handleLogout() {
    localStorage.removeItem('user');
    window.location.href = '/login';
  }

  const firstName = (profileName || 'Guest').trim().split(' ')[0];

  // Categories shown in the "Add transaction" form come from the budget items.
  const budgetCategoryNames = budgets.map((item) => item.name);
  const defaultExpenseCategory = budgetCategoryNames[0] || 'Other';

  const categoryOptions = Array.from(
    new Set([
      ...(budgetCategoryNames.length > 0 ? budgetCategoryNames : ['Other']),
      ...(transactionType === 'Expense' && transactionCategory
        ? [transactionCategory]
        : []),
    ]),
  ).filter((name) => name !== 'Income');

  // Work out which dates belong to the selected dashboard period.
  const now = new Date();
  const currentMonthKey = getMonthKey(getLocalDateString(now));

  const periodTransactions = useMemo(() => {
    let targetMonth;

    if (selectedPeriod === 'This month') {
      targetMonth = currentMonthKey;
    } else if (selectedPeriod === 'Last month') {
      const lastMonthDate = new Date(
        now.getFullYear(),
        now.getMonth() - 1,
        1,
      );

      targetMonth = getMonthKey(getLocalDateString(lastMonthDate));
    } else {
      // A custom month is stored internally as YYYY-MM.
      targetMonth = selectedPeriod;
    }

    return transactions.filter((transaction) => {
      if (!transaction.date) return false;

      return getMonthKey(transaction.date) === targetMonth;
    });
  }, [transactions, selectedPeriod, currentMonthKey]);

  const totalExpenses = periodTransactions
    .filter((item) => item.amount < 0)
    .reduce((sum, item) => sum + Math.abs(item.amount), 0);

  const totalIncome = periodTransactions
    .filter((item) => item.amount > 0)
    .reduce((sum, item) => sum + item.amount, 0);

  const balance = totalIncome - totalExpenses;

  // Build category totals from real expense transactions.
  const categories = useMemo(() => {
    const totals = {};

    periodTransactions
      .filter((item) => item.amount < 0)
      .forEach((item) => {
        const category = item.category || 'Other';

        totals[category] = (totals[category] || 0) + Math.abs(item.amount);
      });

    return Object.entries(totals)
      .map(([name, amount]) => ({
        name,
        amount,
        color: getCategoryColor(name),
      }))
      .sort((a, b) => b.amount - a.amount);
  }, [periodTransactions]);

  // The monthly graph starts with the current month and includes
  // the previous five months. Every bar uses real database records.
  const monthlyExpenses = useMemo(() => {
    const months = [];

    for (let offset = 5; offset >= 0; offset -= 1) {
      const date = new Date(now.getFullYear(), now.getMonth() - offset, 1);

      const key = getMonthKey(getLocalDateString(date));

      months.push({
        key,
        month: getMonthLabel(date),
        amount: 0,
        isCurrent: offset === 0,
      });
    }

    const totalsByMonth = {};

    transactions.forEach((transaction) => {
      if (transaction.amount >= 0 || !transaction.date) return;

      const monthKey = getMonthKey(transaction.date);

      totalsByMonth[monthKey] =
        (totalsByMonth[monthKey] || 0) + Math.abs(transaction.amount);
    });

    return months.map((month) => ({
      ...month,
      amount: totalsByMonth[month.key] || 0,
    }));
  }, [transactions, currentMonthKey]);

  const monthlyChartMaximum = Math.max(
    ...monthlyExpenses.map((item) => item.amount),
    1,
  );

  // Only the budget items the user has (or created) are listed.
  // Spending comes from actual expenses in the selected period.
  const calculatedBudgets = useMemo(() => {
    const categoryTotals = {};

    periodTransactions
      .filter((item) => item.amount < 0)
      .forEach((item) => {
        const category = item.category || 'Other';

        categoryTotals[category] =
          (categoryTotals[category] || 0) + Math.abs(item.amount);
      });

    return budgets.map((budget) => ({
      name: budget.name,
      spent: categoryTotals[budget.name] || 0,
      limit: budget.limit,
      color: getCategoryColor(budget.name),
    }));
  }, [budgets, periodTransactions]);

  const totalBudget = calculatedBudgets.reduce(
    (sum, item) => sum + item.limit,
    0,
  );

  const budgetSpent = calculatedBudgets.reduce(
    (sum, item) => sum + item.spent,
    0,
  );

  function navigateTo(page) {
    setActivePage(page);
    setSearchTerm('');
    setFilterType('All');
    setBudgetMessage('');
    setBudgetError('');
    setEditingBudget(null);
    setGreeting(getGreeting());
  }

  function openEditTransaction(item) {
    setEditingTransactionId(item.id);
    setTransactionName(item.name);
    setTransactionAmount(String(Math.abs(item.amount)));
    setTransactionType(item.amount > 0 ? 'Income' : 'Expense');
    setTransactionCategory(item.amount > 0 ? 'Income' : item.category);
    setShowAddTransaction(true);
  }

  function closeTransactionModal() {
    setShowAddTransaction(false);
    setEditingTransactionId(null);
    setTransactionName('');
    setTransactionAmount('');
    setTransactionCategory(defaultExpenseCategory);
    setTransactionType('Expense');
  }

  async function handleDeleteTransaction(item) {
    if (!window.confirm(`Delete "${item.name}"?`)) return;

    try {
      await deleteTransaction(item.id);

      setTransactions((previous) =>
        previous.filter((transaction) => transaction.id !== item.id),
      );
    } catch (error) {
      console.error('Could not delete transaction:', error);
      alert('Could not delete the transaction. Please try again.');
    }
  }

  async function addTransaction(event) {
    event.preventDefault();

    const amount = Number(transactionAmount);

    if (
      !transactionName.trim() ||
      !Number.isFinite(amount) ||
      amount <= 0
    ) {
      return;
    }

    const originalTransaction = editingTransactionId
      ? transactions.find((item) => item.id === editingTransactionId)
      : null;

    const transactionToSave = {
      title: transactionName.trim(),
      amount,
      type: transactionType.toLowerCase(),
      category:
        transactionType === 'Income' ? 'Income' : transactionCategory,
      description: originalTransaction?.description || '',
      date: originalTransaction?.date || getLocalDateString(),
      paymentMethod: originalTransaction?.paymentMethod || 'Cash',
    };

    try {
      setIsSavingTransaction(true);
      setTransactionError('');

      if (editingTransactionId) {
        const updated = await updateTransaction(
          editingTransactionId,
          transactionToSave,
        );
        const updatedTransaction = mapBackendTransaction(updated);

        setTransactions((previous) =>
          previous
            .map((item) =>
              item.id === editingTransactionId ? updatedTransaction : item,
            )
            .sort((a, b) => (b.date || '').localeCompare(a.date || '')),
        );
      } else {
        const saved = await createTransaction(transactionToSave);
        const newTransaction = mapBackendTransaction(saved);

        setTransactions((previous) =>
          [newTransaction, ...previous].sort((a, b) =>
            (b.date || '').localeCompare(a.date || ''),
          ),
        );
      }

      closeTransactionModal();
    } catch (error) {
      console.error('Could not save transaction:', error);

      if (editingTransactionId) {
        alert('Could not update the transaction. Please try again.');
      } else {
        setTransactionError(
          'Could not save the transaction. Check that the backend is running and try again.',
        );
      }
    } finally {
      setIsSavingTransaction(false);
    }
  }

  function addBudget(event) {
    event.preventDefault();

    const name = newBudgetName.trim();
    const limit = Number(newBudgetAmount);

    setBudgetMessage('');
    setBudgetError('');

    if (!name) {
      setBudgetError('Please enter a name for the budget item.');
      return;
    }

    if (!Number.isFinite(limit) || limit <= 0) {
      setBudgetError('Please enter a monthly limit greater than 0.');
      return;
    }

    if (name.toLowerCase() === 'income') {
      setBudgetError('"Income" is reserved. Please choose another name.');
      return;
    }

    if (
      budgets.some((budget) => budget.name.toLowerCase() === name.toLowerCase())
    ) {
      setBudgetError(`A budget named "${name}" already exists.`);
      return;
    }

    setBudgets((previous) => [...previous, { name, limit }]);
    setBudgetMessage(`${name} budget added.`);
    setNewBudgetName('');
    setNewBudgetAmount('');
  }

  function deleteBudget(name) {
    const confirmed = window.confirm(
      `Delete the "${name}" budget?\n\nYour saved transactions in this category are not deleted.`,
    );

    if (!confirmed) return;

    setBudgets((previous) => previous.filter((budget) => budget.name !== name));

    if (editingBudget === name) {
      setEditingBudget(null);
    }

    setBudgetError('');
    setBudgetMessage(`${name} budget deleted.`);
  }

  function saveBudget(event) {
    event.preventDefault();

    const limit = Number(newBudgetLimit);

    if (!Number.isFinite(limit) || limit <= 0 || !editingBudget) {
      return;
    }

    setBudgets((previous) =>
      previous.map((budget) =>
        budget.name === editingBudget ? { ...budget, limit } : budget,
      ),
    );

    setBudgetError('');
    setBudgetMessage(`${editingBudget} budget updated.`);
    setEditingBudget(null);
    setNewBudgetLimit('');
  }

  function renderSummaryCards() {
    return (
      <section className="summary-grid with-hero">
        <article className="summary-card balance-card">
          <div className="balance-decoration" />
          <div className="balance-ring" />

          <svg
            className="balance-line"
            viewBox="0 0 200 70"
            fill="none"
            aria-hidden="true"
          >
            <path
              d="M0 55 L30 40 L60 48 L90 25 L120 32 L150 12 L200 18"
              stroke="#ffffff"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity="0.9"
            />
            <circle cx="200" cy="18" r="5" fill="#ffffff" />
          </svg>

          <div className="summary-top">
            <span className="summary-label">
              {selectedPeriod === 'This month'
                ? 'This month’s balance'
                : selectedPeriod === 'Last month'
                  ? 'Last month’s balance'
                  : 'Balance for this month'}
            </span>
            <span className="summary-icon balance-icon">
              <Icon name="wallet" />
            </span>
          </div>

          <h2>{money(balance)}</h2>

          <div className="summary-bottom">
            <span className="trend-pill">Live</span>
            <span className="summary-caption">From saved transactions</span>
          </div>
        </article>

        <article className="summary-card">
          <div className="summary-top">
            <span className="summary-label">Total income</span>
            <span className="summary-icon income-icon">
              <Icon name="income" />
            </span>
          </div>

          <h2>{money(totalIncome)}</h2>

          <div className="summary-bottom">
            <span className="trend-pill">Live</span>
            <span className="summary-caption">
              {selectedPeriod.toLowerCase()}
            </span>

            <div className="mini-sparkline income-sparkline">
              {[30, 48, 39, 65, 53, 82, 100].map((height, index) => (
                <span key={index} style={{ height: `${height}%` }} />
              ))}
            </div>
          </div>
        </article>

        <article className="summary-card">
          <div className="summary-top">
            <span className="summary-label">Total expenses</span>
            <span className="summary-icon expense-icon">
              <Icon name="expense" />
            </span>
          </div>

          <h2>{money(totalExpenses)}</h2>

          <div className="summary-bottom">
            <span className="trend-pill expense-trend">Live</span>
            <span className="summary-caption">
              {selectedPeriod.toLowerCase()}
            </span>

            <div className="mini-sparkline expense-sparkline">
              {[65, 42, 75, 50, 90, 57, 38].map((height, index) => (
                <span key={index} style={{ height: `${height}%` }} />
              ))}
            </div>
          </div>
        </article>
      </section>
    );
  }

  function renderExpenseChart() {
    const total = categories.reduce((sum, item) => sum + item.amount, 0);

    let runningTotal = 0;

    const gradient =
      total > 0
        ? categories
            .map((item) => {
              const start = (runningTotal / total) * 100;

              runningTotal += item.amount;

              const end = (runningTotal / total) * 100;

              return `${item.color} ${start}% ${end}%`;
            })
            .join(', ')
        : '#e8eaf0 0% 100%';

    return (
      <article className="panel expense-panel">
        <div className="panel-header">
          <div>
            <h3>Expenses by category</h3>
            <p>
              {selectedPeriod === 'This month'
                ? 'Current month’s saved expenses'
                : selectedPeriod === 'Last month'
                  ? 'Last month’s saved expenses'
                  : 'Saved expenses for the selected month'}
            </p>
          </div>
        </div>

        <div className="donut-section">
          <div
            className="donut-chart"
            role="img"
            aria-label="Expenses by category donut chart"
            style={{ background: `conic-gradient(${gradient})` }}
          >
            <div className="donut-hole">
              <span>Total spent</span>
              <strong>{money(total)}</strong>
              <small>{selectedPeriod}</small>
            </div>
          </div>

          <div className="category-legend">
            {categories.map((item) => (
              <div className="legend-item" key={item.name}>
                <span
                  className="legend-dot"
                  style={{ background: item.color }}
                />

                <span className="legend-name">{item.name}</span>

                <strong>{money(item.amount)}</strong>
              </div>
            ))}

            {categories.length === 0 && (
              <p className="empty-state">
                No expenses recorded for this period.
              </p>
            )}
          </div>
        </div>
      </article>
    );
  }

  function renderSpendingChart() {
    return (
      <article className="panel spending-panel">
        <div className="panel-header">
          <div>
            <h3>Spending overview</h3>
            <p>Actual expenses over the last six months</p>
          </div>

          <span className="chart-filter">Monthly</span>
        </div>

        <div className="spending-summary">
          <strong>{money(totalExpenses)}</strong>
          <span className="spending-change">This month</span>
        </div>

        <div className="bar-chart">
          <div className="chart-grid-lines">
            <span />
            <span />
            <span />
            <span />
          </div>

          {monthlyExpenses.map((item) => (
            <div className="bar-column" key={item.key}>
              <div
                className={`chart-bar ${item.isCurrent ? 'current-bar' : ''}`}
                style={{
                  height: `${
                    item.amount === 0
                      ? 0
                      : Math.max((item.amount / monthlyChartMaximum) * 100, 3)
                  }%`,
                }}
                title={`${item.month}: ${money(item.amount)}`}
              />

              <span className="bar-label">{item.month}</span>
            </div>
          ))}
        </div>

        <div className="chart-footnote">
          <span className="legend-dot" style={{ background: '#e8a6be' }} />
          Monthly expenses
          <span className="chart-footnote-right">
            Current month highlighted
          </span>
        </div>
      </article>
    );
  }

  function renderTransactions(limit = transactions.length) {
    const filtered = transactions.filter((item) => {
      const matchesSearch =
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.category.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesType =
        filterType === 'All' ||
        (filterType === 'Income' && item.amount > 0) ||
        (filterType === 'Expense' && item.amount < 0);

      return matchesSearch && matchesType;
    });

    return (
      <article className="panel transactions-panel">
        <div className="panel-header">
          <div>
            <h3>
              {activePage === 'Overview'
                ? 'Recent transactions'
                : 'All transactions'}
            </h3>

            <p>
              {activePage === 'Overview'
                ? 'Your latest saved transactions'
                : `${filtered.length} transactions found`}
            </p>
          </div>

          {activePage === 'Overview' && (
            <button
              type="button"
              className="view-all-button"
              onClick={() => navigateTo('Transactions')}
            >
              View all →
            </button>
          )}

          {activePage === 'Transactions' && (
            <button
              type="button"
              className="auth-submit transaction-add-button"
              onClick={() => setShowAddTransaction(true)}
            >
              <Icon name="plus" size={18} />
              Add transaction
            </button>
          )}
        </div>

        {activePage === 'Transactions' && (
          <div className="transaction-filters">
            <input
              type="search"
              placeholder="Search transactions..."
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              aria-label="Search transactions"
            />

            <select
              value={filterType}
              onChange={(event) => setFilterType(event.target.value)}
              aria-label="Filter by type"
            >
              <option>All</option>
              <option>Income</option>
              <option>Expense</option>
            </select>
          </div>
        )}

        <div className="transaction-list">
          {filtered.slice(0, limit).map((item) => (
            <div className="transaction-row" key={item.id}>
              <div
                className={`transaction-icon ${item.amount > 0 ? 'green' : ''}`}
                style={
                  item.amount < 0
                    ? { background: `${getCategoryColor(item.category)}55` }
                    : undefined
                }
              >
                <Icon name={item.icon} size={22} />
              </div>

              <div className="transaction-details">
                <strong>{item.name}</strong>
                <span>{item.category}</span>
              </div>

              <div className="transaction-amount">
                <strong className={item.amount > 0 ? 'positive' : ''}>
                  {item.amount > 0 ? '+' : '−'}
                  {money(Math.abs(item.amount))}
                </strong>

                <span>{item.date}</span>
              </div>

              {activePage === 'Transactions' && (
                <div className="transaction-actions">
                  <button
                    type="button"
                    className="row-action"
                    aria-label={`Edit ${item.name}`}
                    onClick={() => openEditTransaction(item)}
                  >
                    <Icon name="edit" size={16} />
                  </button>

                  <button
                    type="button"
                    className="row-action danger"
                    aria-label={`Delete ${item.name}`}
                    onClick={() => handleDeleteTransaction(item)}
                  >
                    <Icon name="trash" size={16} />
                  </button>
                </div>
              )}
            </div>
          ))}

          {!isLoadingTransactions && filtered.length === 0 && (
            <p className="empty-state">
              {transactions.length === 0
                ? 'No saved transactions yet. Add your first transaction!'
                : 'No transactions match your search.'}
            </p>
          )}
        </div>
      </article>
    );
  }

  function renderBudgets() {
    const isBudgetsPage = activePage === 'Budgets';

    // The overview shows a short list; the Budgets page shows everything.
    const visibleBudgets = isBudgetsPage
      ? calculatedBudgets
      : calculatedBudgets.slice(0, 5);

    return (
      <article className="panel budget-panel">
        <div className="panel-header">
          <div>
            <h3>Monthly budgets</h3>
            <p>Actual spending compared with your budget limits</p>
          </div>
        </div>

        {budgetMessage && (
          <p className="success-message">{budgetMessage}</p>
        )}

        {budgetError && (
          <p className="error-message" role="alert">
            {budgetError}
          </p>
        )}

        <div className="budget-total">
          <div>
            <span>Total budget used</span>

            <strong>
              {money(budgetSpent)} <small>/ {money(totalBudget)}</small>
            </strong>
          </div>

          <div className="budget-percentage">
            {totalBudget ? Math.round((budgetSpent / totalBudget) * 100) : 0}%
          </div>
        </div>

        {isBudgetsPage && (
          <form className="budget-add-form" onSubmit={addBudget}>
            <label>
              New budget name
              <input
                value={newBudgetName}
                onChange={(event) => setNewBudgetName(event.target.value)}
                placeholder="e.g. Gym, Rent, Travel"
                maxLength={24}
              />
            </label>

            <label>
              Monthly limit
              <input
                type="number"
                min="1"
                value={newBudgetAmount}
                onChange={(event) => setNewBudgetAmount(event.target.value)}
                placeholder="e.g. 2000"
              />
            </label>

            <button className="auth-submit" type="submit">
              <Icon name="plus" size={18} />
              Add budget
            </button>
          </form>
        )}

        <div className="budget-list">
          {visibleBudgets.map((budget) => {
            const percentage = budget.limit
              ? Math.min((budget.spent / budget.limit) * 100, 100)
              : 0;

            return (
              <div
                className={`budget-item ${
                  budget.spent > budget.limit ? 'over' : ''
                }`}
                key={budget.name}
              >
                <div className="budget-item-top">
                  <span>
                    <i style={{ background: budget.color }} />
                    {budget.name}
                  </span>

                  <strong>
                    {money(budget.spent)}{' '}
                    <small>/ {money(budget.limit)}</small>
                  </strong>
                </div>

                <div className="budget-progress">
                  <span
                    style={{
                      width: `${percentage}%`,
                      background: budget.color,
                    }}
                  />
                </div>

                {isBudgetsPage && (
                  <div className="budget-actions">
                    <button
                      type="button"
                      className="edit-budget-button"
                      onClick={() => {
                        setEditingBudget(budget.name);
                        setNewBudgetLimit(String(budget.limit));
                        setBudgetMessage('');
                        setBudgetError('');
                      }}
                    >
                      Edit limit
                    </button>

                    <button
                      type="button"
                      className="delete-budget-button"
                      onClick={() => deleteBudget(budget.name)}
                    >
                      Delete
                    </button>
                  </div>
                )}
              </div>
            );
          })}

          {calculatedBudgets.length === 0 && (
            <p className="empty-state">
              {isBudgetsPage
                ? 'No budget items yet. Add your first one above.'
                : 'No budget items yet. Add one on the Budgets page.'}
            </p>
          )}
        </div>

        {activePage === 'Overview' && (
          <button
            type="button"
            className="manage-budgets-button"
            onClick={() => navigateTo('Budgets')}
          >
            Manage budgets →
          </button>
        )}

        {editingBudget && isBudgetsPage && (
          <form className="budget-edit-form" onSubmit={saveBudget}>
            <label>
              New limit for {editingBudget}
              <input
                type="number"
                min="1"
                required
                value={newBudgetLimit}
                onChange={(event) => setNewBudgetLimit(event.target.value)}
              />
            </label>

            <button className="auth-submit" type="submit">
              Save budget
            </button>

            <button
              type="button"
              className="cancel-button"
              onClick={() => setEditingBudget(null)}
            >
              Cancel
            </button>
          </form>
        )}
      </article>
    );
  }

  function renderReports() {
    const totalSpent = transactions
      .filter((item) => item.amount < 0)
      .reduce((sum, item) => sum + Math.abs(item.amount), 0);

    const totalEarned = transactions
      .filter((item) => item.amount > 0)
      .reduce((sum, item) => sum + item.amount, 0);

    function exportTransactions() {
      const rows = [
        ['Name', 'Category', 'Date', 'Amount'],
        ...transactions.map((item) => [
          item.name,
          item.category,
          item.date,
          item.amount,
        ]),
      ];

      const csv = rows
        .map((row) =>
          row
            .map((value) => `"${String(value).replaceAll('"', '""')}"`)
            .join(','),
        )
        .join('\n');

      const url = URL.createObjectURL(
        new Blob([csv], { type: 'text/csv;charset=utf-8;' }),
      );

      const link = document.createElement('a');
      link.href = url;
      link.download = 'expensia-transactions.csv';
      link.click();

      URL.revokeObjectURL(url);
    }

    return (
      <>
        <section className="summary-grid">
          <article className="summary-card">
            <span className="summary-label">Recorded income</span>
            <h2>{money(totalEarned)}</h2>
            <p className="summary-caption">All saved income transactions</p>
          </article>

          <article className="summary-card">
            <span className="summary-label">Recorded expenses</span>
            <h2>{money(totalSpent)}</h2>
            <p className="summary-caption">All saved expense transactions</p>
          </article>

          <article className="summary-card">
            <span className="summary-label">Net cash flow</span>
            <h2>{money(totalEarned - totalSpent)}</h2>
            <p className="summary-caption">Income minus expenses</p>
          </article>
        </section>

        <section className="analytics-grid">
          {renderExpenseChart()}
          {renderSpendingChart()}
        </section>

        <article className="panel">
          <h3>Financial report</h3>

          <p className="report-note">
            This report uses transactions loaded from your Expensia database.
          </p>

          <button
            type="button"
            className="auth-submit export-button"
            onClick={exportTransactions}
          >
            Export transactions as CSV ↓
          </button>
        </article>
      </>
    );
  }

  function renderSettings() {
    return (
      <article className="panel settings-panel">
        <div className="panel-header">
          <div>
            <h3>Account settings</h3>
            <p>Personalise your Expensia experience</p>
          </div>
        </div>

        <form
          className="settings-form"
          onSubmit={(event) => {
            event.preventDefault();
            alert(
              'Settings saved for this session. Backend persistence will be added later.',
            );
          }}
        >
          <label>
            Display name
            <input
              value={profileName}
              onChange={(event) => setProfileName(event.target.value)}
              required
            />
          </label>

          <label>
            Email address
            <input
              type="email"
              value={profileEmail}
              onChange={(event) => setProfileEmail(event.target.value)}
              required
            />
          </label>

          <label>
            Display currency
            <select
              value={currency}
              onChange={(event) => setCurrency(event.target.value)}
            >
              <option value="INR">Indian Rupee (INR ₹)</option>
              <option value="USD">US Dollar (USD $)</option>
              <option value="EUR">Euro (EUR €)</option>
              <option value="GBP">British Pound (GBP £)</option>
            </select>
          </label>

          <button className="auth-submit" type="submit">
            Save settings
          </button>
        </form>

        <p className="report-note">
          These preferences currently stay in React state. Database
          persistence and authentication will be added later.
        </p>
      </article>
    );
  }

  function renderPageContent() {
    switch (activePage) {
      case 'Transactions':
        return renderTransactions();

      case 'Budgets':
        return renderBudgets();

      case 'Reports':
        return renderReports();

      case 'Settings':
        return renderSettings();

      default:
        return (
          <>
            {renderSummaryCards()}

            <section className="analytics-grid">
              {renderExpenseChart()}
              {renderSpendingChart()}
            </section>

            <section className="bottom-grid">
              {renderTransactions(4)}
              {renderBudgets()}
            </section>
          </>
        );
    }
  }

  return (
    <div className="dashboard">
      <aside className="sidebar">
        <div className="dashboard-brand">
          <span>
            expensia<span className="brand-dot">.</span>
          </span>
        </div>

        <div className="sidebar-label">MENU</div>

        <nav className="sidebar-nav">
          {navigation.map((item) => (
            <button
              type="button"
              key={item.name}
              className={`nav-item ${activePage === item.name ? 'active' : ''}`}
              onClick={() => navigateTo(item.name)}
            >
              <span className="nav-icon">
                <Icon name={item.icon} />
              </span>
              <span>{item.name}</span>
            </button>
          ))}
        </nav>

        <div className="sidebar-label tools-label">PREFERENCES</div>

        <nav className="sidebar-nav">
          <button
            type="button"
            className={`nav-item ${activePage === 'Settings' ? 'active' : ''}`}
            onClick={() => navigateTo('Settings')}
          >
            <span className="nav-icon">
              <Icon name="settings" />
            </span>
            <span>Settings</span>
          </button>
        </nav>

        <div className="sidebar-bottom">
          <div className="help-card">
            <strong>Need a little help?</strong>
            <p>Make your money work smarter.</p>

            <button
              type="button"
              onClick={() => alert('Help centre coming soon!')}
            >
              Visit help centre →
            </button>
          </div>

          <div className="profile-card">
            <div className="profile-avatar">
              {profileName.trim().charAt(0).toUpperCase() || 'U'}
            </div>

            <div className="profile-info">
              <strong>{profileName || 'Guest'}</strong>
              <span>Personal account</span>
            </div>
          </div>

          <button
            type="button"
            className="logout-button"
            onClick={handleLogout}
          >
            <Icon name="logout" size={18} />
            Log out
          </button>
        </div>
      </aside>

      <main className="dashboard-main">
        <header className="dashboard-header">
          <div>
            <p className="header-eyebrow">YOUR FINANCIAL SPACE</p>

            <h1>
              {activePage === 'Overview'
                ? `${greeting}, ${firstName}`
                : activePage}
              <span className="heading-dot">.</span>
            </h1>

            <p className="header-subtitle">
              {activePage === 'Overview'
                ? "Here's what's happening with your money."
                : `Manage your ${activePage.toLowerCase()} in one place.`}
            </p>
          </div>

          <div className="header-actions">
            <button
              type="button"
              className="icon-button notification-button"
              aria-label="Notifications"
              onClick={() => alert('You are all caught up!')}
            >
              <Icon name="bell" />
              <span className="notification-dot" />
            </button>

            <select
              className="period-select"
              value={selectedPeriod}
              onChange={(event) => setSelectedPeriod(event.target.value)}
              aria-label="Select dashboard time period"
            >
              <option value="This month">
                This month (
                {new Date().toLocaleString('en-US', { month: 'short' })})
              </option>

              <option value="Last month">
                Last month (
                {new Date(
                  new Date().getFullYear(),
                  new Date().getMonth() - 1,
                  1,
                ).toLocaleString('en-US', { month: 'short' })}
                )
              </option>

              {Array.from({ length: 12 }, (_, index) => {
                const date = new Date();
                date.setDate(1);
                date.setMonth(date.getMonth() - index);

                return {
                  name: date.toLocaleString('en-US', { month: 'short' }),
                  value: `${date.getFullYear()}-${String(
                    date.getMonth() + 1,
                  ).padStart(2, '0')}`,
                  month: date.getMonth(),
                };
              })
                .sort((a, b) => a.month - b.month)
                .map((item) => {
                  const today = new Date();

                  const currentMonth = `${today.getFullYear()}-${String(
                    today.getMonth() + 1,
                  ).padStart(2, '0')}`;

                  const previousDate = new Date(
                    today.getFullYear(),
                    today.getMonth() - 1,
                    1,
                  );

                  const previousMonth = `${previousDate.getFullYear()}-${String(
                    previousDate.getMonth() + 1,
                  ).padStart(2, '0')}`;

                  if (
                    item.value === currentMonth ||
                    item.value === previousMonth
                  ) {
                    return null;
                  }

                  return (
                    <option key={item.value} value={item.value}>
                      {item.name}
                    </option>
                  );
                })}
            </select>
          </div>
        </header>

        {transactionError && (
          <p className="error-message" role="alert">
            {transactionError}
          </p>
        )}

        {isLoadingTransactions && (
          <p className="report-note">
            Loading transactions from your database...
          </p>
        )}

        {!isLoadingTransactions && !transactionError && renderPageContent()}

        {transactionError && !isLoadingTransactions && (
          <button
            type="button"
            className="auth-submit"
            onClick={() => window.location.reload()}
          >
            Retry connection
          </button>
        )}

        <footer className="dashboard-footer">
          <span>© 2026 Expensia</span>
          <span>Small steps today, stronger finances tomorrow.</span>
        </footer>
      </main>

      {showAddTransaction && (
        <div
          className="modal-backdrop"
          onClick={() => {
            if (!isSavingTransaction) closeTransactionModal();
          }}
        >
          <form
            className="transaction-modal"
            onSubmit={addTransaction}
            onClick={(event) => event.stopPropagation()}
          >
            <div className="panel-header">
              <h3>
                {editingTransactionId
                  ? 'Edit transaction'
                  : 'Add transaction'}
              </h3>

              <button
                type="button"
                className="more-button"
                aria-label="Close form"
                disabled={isSavingTransaction}
                onClick={closeTransactionModal}
              >
                <Icon name="close" size={16} />
              </button>
            </div>

            <label>
              Transaction name
              <input
                value={transactionName}
                onChange={(event) => setTransactionName(event.target.value)}
                placeholder="e.g. Lunch"
                required
              />
            </label>

            <label>
              Amount
              <input
                type="number"
                min="0.01"
                step="0.01"
                value={transactionAmount}
                onChange={(event) => setTransactionAmount(event.target.value)}
                placeholder="Enter amount"
                required
              />
            </label>

            <label>
              Type
              <select
                value={transactionType}
                onChange={(event) => {
                  setTransactionType(event.target.value);
                  setTransactionCategory(
                    event.target.value === 'Income'
                      ? 'Income'
                      : defaultExpenseCategory,
                  );
                }}
              >
                <option>Expense</option>
                <option>Income</option>
              </select>
            </label>

            {transactionType === 'Expense' && (
              <label>
                Category
                <select
                  value={transactionCategory}
                  onChange={(event) =>
                    setTransactionCategory(event.target.value)
                  }
                >
                  {categoryOptions.map((category) => (
                    <option key={category}>{category}</option>
                  ))}
                </select>
              </label>
            )}

            <button
              className="auth-submit"
              type="submit"
              disabled={isSavingTransaction}
            >
              {isSavingTransaction
                ? 'Saving...'
                : editingTransactionId
                  ? 'Save changes'
                  : 'Save transaction'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

function App() {
  const [user] = useState(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  return (
    <Routes>
      <Route
        path="/login"
        element={user ? <Navigate to="/" replace /> : <Login />}
      />
      <Route
        path="/register"
        element={user ? <Navigate to="/" replace /> : <Register />}
      />
      <Route
        path="/"
        element={user ? <Dashboard /> : <Navigate to="/login" replace />}
      />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default App;
