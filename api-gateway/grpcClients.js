const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const path = require('path');

function loadProto(file) {
  const def = protoLoader.loadSync(
    path.join(__dirname, '../proto', file),
    { keepCase: true, longs: String, enums: String, defaults: true }
  );
  return grpc.loadPackageDefinition(def);
}

const userProto  = loadProto('users.proto');
const accountProto = loadProto('accounts.proto');
const notifProto = loadProto('notifications.proto');

const usersClient = new userProto.users.UserService(
  'localhost:50051', grpc.credentials.createInsecure());

const accountsClient = new accountProto.accounts.AccountService(
  'localhost:50052', grpc.credentials.createInsecure());

const notifClient = new notifProto.notifications.NotificationService(
  'localhost:50053', grpc.credentials.createInsecure());

module.exports = { usersClient, accountsClient, notifClient };