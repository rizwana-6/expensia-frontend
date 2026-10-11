import { API_URL } from './config';

const API_BASE_URL = `${API_URL}/api/transactions`;

// Get the logged-in user's ID
function getUserId() {
  const user = JSON.parse(localStorage.getItem('user'));

  if (!user || !user.id) {
    throw new Error('Please log in first.');
  }

  return user.id;
}

// Get transactions for the logged-in user
export async function getTransactions() {
  const userId = getUserId();

  const response = await fetch(
    `${API_BASE_URL}?userId=${userId}`
  );

  if (!response.ok) {
    throw new Error('Failed to fetch transactions.');
  }

  return response.json();
}

// Create a transaction for the logged-in user
export async function createTransaction(transaction) {
  const userId = getUserId();

  const response = await fetch(
    `${API_BASE_URL}?userId=${userId}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(transaction),
    }
  );

  if (!response.ok) {
    throw new Error('Failed to create transaction.');
  }

  return response.json();
}

// Update a transaction
export async function updateTransaction(id, transaction) {
  const response = await fetch(`${API_BASE_URL}/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(transaction),
  });

  if (!response.ok) {
    throw new Error('Failed to update transaction.');
  }

  return response.json();
}

// Delete a transaction
export async function deleteTransaction(id) {
  const response = await fetch(`${API_BASE_URL}/${id}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    throw new Error('Failed to delete transaction.');
  }
}