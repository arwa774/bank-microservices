const db = require('./db');
const { publishTransactionCompleted, publishLowBalance } = require('./kafka');
const { v4: uuidv4 } = require('uuid');

function createAccount(call, callback) {
  try {
    const { userId, type } = call.request;
    if (!userId) return callback({ code: 3, message: 'userId is required' });
    const id = uuidv4();
    db.prepare('INSERT INTO accounts (id, userId, type, balance) VALUES (?, ?, ?, ?)')
      .run(id, userId, type || 'checking', 0.0);
    callback(null, { id, userId, balance: 0.0, type: type || 'checking' });
  } catch (err) {
    callback({ code: 2, message: err.message });
  }
}

function getAccount(call, callback) {
  try {
    const account = db.prepare('SELECT * FROM accounts WHERE id = ?').get(call.request.accountId);
    if (!account) return callback({ code: 5, message: 'Account not found' });
    callback(null, { id: account.id, userId: account.userId, balance: account.balance, type: account.type });
  } catch (err) {
    callback({ code: 2, message: err.message });
  }
}

function deposit(call, callback) {
  try {
    const { accountId, amount, description } = call.request;
    if (amount <= 0) return callback({ code: 3, message: 'Amount must be positive' });

    const account = db.prepare('SELECT * FROM accounts WHERE id = ?').get(accountId);
    if (!account) return callback({ code: 5, message: 'Account not found' });

    const newBalance = account.balance + amount;
    db.prepare('UPDATE accounts SET balance = ? WHERE id = ?').run(newBalance, accountId);
    db.prepare('INSERT INTO transactions (id, accountId, type, amount, description) VALUES (?, ?, ?, ?, ?)')
      .run(uuidv4(), accountId, 'deposit', amount, description || '');

    publishTransactionCompleted({ accountId, userId: account.userId, type: 'deposit', amount, newBalance });

    callback(null, { id: account.id, userId: account.userId, balance: newBalance, type: account.type });
  } catch (err) {
    callback({ code: 2, message: err.message });
  }
}

function withdraw(call, callback) {
  try {
    const { accountId, amount, description } = call.request;
    if (amount <= 0) return callback({ code: 3, message: 'Amount must be positive' });

    const account = db.prepare('SELECT * FROM accounts WHERE id = ?').get(accountId);
    if (!account) return callback({ code: 5, message: 'Account not found' });
    if (account.balance < amount) return callback({ code: 3, message: 'Insufficient balance' });

    const newBalance = account.balance - amount;
    db.prepare('UPDATE accounts SET balance = ? WHERE id = ?').run(newBalance, accountId);
    db.prepare('INSERT INTO transactions (id, accountId, type, amount, description) VALUES (?, ?, ?, ?, ?)')
      .run(uuidv4(), accountId, 'withdrawal', amount, description || '');

    publishTransactionCompleted({ accountId, userId: account.userId, type: 'withdrawal', amount, newBalance });

    if (newBalance < 100) {
      publishLowBalance({ accountId, userId: account.userId, balance: newBalance });
    }

    callback(null, { id: account.id, userId: account.userId, balance: newBalance, type: account.type });
  } catch (err) {
    callback({ code: 2, message: err.message });
  }
}

function getTransactions(call, callback) {
  try {
    const rows = db.prepare('SELECT * FROM transactions WHERE accountId = ? ORDER BY date DESC').all(call.request.accountId);
    callback(null, {
      transactions: rows.map(t => ({
        id: t.id, type: t.type, amount: t.amount,
        description: t.description || '', date: t.date
      }))
    });
  } catch (err) {
    callback({ code: 2, message: err.message });
  }
}

module.exports = { createAccount, getAccount, deposit, withdraw, getTransactions };