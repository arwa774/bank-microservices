const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const path = require('path');
const { createAccount, getAccount, deposit, withdraw, getTransactions } = require('./accountService');

const def = protoLoader.loadSync(
  path.join(__dirname, '../proto/accounts.proto'),
  { keepCase: true, longs: String, enums: String, defaults: true }
);
const proto = grpc.loadPackageDefinition(def).accounts;

const server = new grpc.Server();
server.addService(proto.AccountService.service, {
  CreateAccount: createAccount,
  GetAccount: getAccount,
  Deposit: deposit,
  Withdraw: withdraw,
  GetTransactions: getTransactions,
});

server.bindAsync('0.0.0.0:50052', grpc.ServerCredentials.createInsecure(), (err, port) => {
  if (err) { console.error(err); return; }
  console.log('MS-Accounts gRPC server running on port 50052');
});