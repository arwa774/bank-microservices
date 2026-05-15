const { Kafka } = require('kafkajs');
const { v4: uuidv4 } = require('uuid');
const { getDB } = require('./db');

async function startConsumer() {
  const kafka = new Kafka({ clientId: 'ms-notifications', brokers: ['localhost:9092'] });
  const consumer = kafka.consumer({ groupId: 'notifications-group' });

  await consumer.connect();
  await consumer.subscribe({
    topics: ['user.created', 'transaction.completed', 'account.low_balance'],
    fromBeginning: true
  });

  await consumer.run({
    eachMessage: async ({ topic, message }) => {
      try {
        const event = JSON.parse(message.value.toString());
        let notifMessage = '';

        if (topic === 'user.created') {
          notifMessage = `Bienvenue ${event.userName} ! Votre compte a été créé avec succès.`;
        } else if (topic === 'transaction.completed') {
          notifMessage = `Transaction ${event.type} de ${event.amount}€ effectuée. Nouveau solde: ${event.newBalance}€`;
        } else if (topic === 'account.low_balance') {
          notifMessage = `Alerte : solde faible de ${event.balance}€ sur votre compte.`;
        }

        const db = getDB();
        await db.notifications.insert({
          id:      uuidv4(),
          userId:  event.userId,
          message: notifMessage,
          read:    false,
          date:    new Date().toISOString()
        });

        console.log(`Notification saved for user ${event.userId}: ${notifMessage}`);
      } catch (err) {
        console.error('Consumer error:', err.message);
      }
    }
  });

  console.log('Kafka consumer listening on: user.created, transaction.completed, account.low_balance');
}

module.exports = { startConsumer };