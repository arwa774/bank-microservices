const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const path = require('path');
const { initDB } = require('./db');
const { startConsumer } = require('./kafkaConsumer');
const { getNotifications, markAsRead } = require('./notificationService');

const def = protoLoader.loadSync(
  path.join(__dirname, '../proto/notifications.proto'),
  { keepCase: true, longs: String, enums: String, defaults: true }
);
const proto = grpc.loadPackageDefinition(def).notifications;

async function main() {
  await initDB();
  console.log('RxDB initialized');

  await startConsumer();

  const server = new grpc.Server();
  server.addService(proto.NotificationService.service, {
    GetNotifications: getNotifications,
    MarkAsRead: markAsRead,
  });

  server.bindAsync('0.0.0.0:50053', grpc.ServerCredentials.createInsecure(), (err) => {
    if (err) { console.error(err); return; }
    console.log('MS-Notifications gRPC server running on port 50053');
  });
}

main().catch(console.error);