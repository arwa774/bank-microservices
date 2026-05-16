const { usersClient, accountsClient, notifClient } = require('../grpcClients');

function grpcCall(client, method, request) {
  return new Promise((resolve, reject) => {
    client[method](request, (err, response) => {
      if (err) reject(new Error(err.message));
      else resolve(response);
    });
  });
}

const resolvers = {
  Query: {
    user:          (_, { id }) =>         grpcCall(usersClient,    'GetUser',           { id }),
    users:         () =>                  grpcCall(usersClient,    'ListUsers',          {}).then(r => r.users),
    account:       (_, { id }) =>         grpcCall(accountsClient, 'GetAccount',         { accountId: id }),
    transactions:  (_, { accountId }) =>  grpcCall(accountsClient, 'GetTransactions',    { accountId }).then(r => r.transactions),
    notifications: (_, { userId }) =>     grpcCall(notifClient,    'GetNotifications',   { userId }).then(r => r.notifications),
  },
  Mutation: {
    createUser:    (_, args) =>           grpcCall(usersClient,    'CreateUser',   args),
    createAccount: (_, args) =>           grpcCall(accountsClient, 'CreateAccount', { userId: args.userId, type: args.type || 'checking' }),
    deposit:       (_, args) =>           grpcCall(accountsClient, 'Deposit',      { accountId: args.accountId, amount: args.amount, description: args.description || '' }),
    withdraw:      (_, args) =>           grpcCall(accountsClient, 'Withdraw',     { accountId: args.accountId, amount: args.amount, description: args.description || '' }),
    markAsRead:    (_, { notificationId }) => grpcCall(notifClient, 'MarkAsRead',  { notificationId }),
  }
};

module.exports = resolvers;