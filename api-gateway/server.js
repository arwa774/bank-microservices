const express = require('express');
const { ApolloServer } = require('apollo-server-express');
const typeDefs = require('./graphql/schema');
const resolvers = require('./graphql/resolvers');
const { usersClient, accountsClient, notifClient } = require('./grpcClients');

const app = express();
app.use(express.json());

function grpcCall(client, method, request) {
  return new Promise((resolve, reject) => {
    client[method](request, (err, response) => {
      if (err) reject(err);
      else resolve(response);
    });
  });
}

app.post('/api/users', async (req, res) => {
  try {
    const result = await grpcCall(usersClient, 'CreateUser', req.body);
    res.status(201).json(result);
  } catch (err) { res.status(400).json({ error: err.message }); }
});

app.get('/api/users', async (req, res) => {
  try {
    const result = await grpcCall(usersClient, 'ListUsers', {});
    res.json(result.users);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/users/:id', async (req, res) => {
  try {
    const result = await grpcCall(usersClient, 'GetUser', { id: req.params.id });
    res.json(result);
  } catch (err) { res.status(404).json({ error: err.message }); }
});

app.post('/api/accounts', async (req, res) => {
  try {
    const result = await grpcCall(accountsClient, 'CreateAccount', req.body);
    res.status(201).json(result);
  } catch (err) { res.status(400).json({ error: err.message }); }
});

app.get('/api/accounts/:id', async (req, res) => {
  try {
    const result = await grpcCall(accountsClient, 'GetAccount', { accountId: req.params.id });
    res.json(result);
  } catch (err) { res.status(404).json({ error: err.message }); }
});

app.post('/api/accounts/:id/deposit', async (req, res) => {
  try {
    const result = await grpcCall(accountsClient, 'Deposit', {
      accountId: req.params.id, ...req.body
    });
    res.json(result);
  } catch (err) { res.status(400).json({ error: err.message }); }
});

app.post('/api/accounts/:id/withdraw', async (req, res) => {
  try {
    const result = await grpcCall(accountsClient, 'Withdraw', {
      accountId: req.params.id, ...req.body
    });
    res.json(result);
  } catch (err) { res.status(400).json({ error: err.message }); }
});

app.get('/api/accounts/:id/transactions', async (req, res) => {
  try {
    const result = await grpcCall(accountsClient, 'GetTransactions', { accountId: req.params.id });
    res.json(result.transactions);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/notifications/:userId', async (req, res) => {
  try {
    const result = await grpcCall(notifClient, 'GetNotifications', { userId: req.params.userId });
    res.json(result.notifications);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.put('/api/notifications/:id/read', async (req, res) => {
  try {
    const result = await grpcCall(notifClient, 'MarkAsRead', { notificationId: req.params.id });
    res.json(result);
  } catch (err) { res.status(400).json({ error: err.message }); }
});

async function startServer() {
  const apollo = new ApolloServer({ typeDefs, resolvers });
  await apollo.start();
  apollo.applyMiddleware({ app, path: '/graphql' });

  app.listen(3000, () => {
    console.log('API Gateway running on http://localhost:3000');
    console.log('GraphQL available at http://localhost:3000/graphql');
  });
}

startServer().catch(console.error);