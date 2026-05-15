const { Kafka } = require('kafkajs');

const kafka = new Kafka({ clientId: 'ms-accounts', brokers: ['localhost:9092'] });
const producer = kafka.producer();

async function publishTransactionCompleted(data) {
  try {
    await producer.connect();
    await producer.send({
      topic: 'transaction.completed',
      messages: [{
        key: data.accountId,
        value: JSON.stringify({
          event: 'TRANSACTION_COMPLETED',
          accountId: data.accountId,
          userId: data.userId,
          type: data.type,
          amount: data.amount,
          newBalance: data.newBalance,
          timestamp: new Date().toISOString()
        })
      }]
    });
    console.log('Kafka event published: TRANSACTION_COMPLETED');
  } catch (err) {
    console.error('Kafka publish error:', err.message);
  }
}

async function publishLowBalance(data) {
  try {
    await producer.connect();
    await producer.send({
      topic: 'account.low_balance',
      messages: [{
        key: data.accountId,
        value: JSON.stringify({
          event: 'LOW_BALANCE_ALERT',
          accountId: data.accountId,
          userId: data.userId,
          balance: data.balance,
          timestamp: new Date().toISOString()
        })
      }]
    });
    console.log('Kafka event published: LOW_BALANCE_ALERT');
  } catch (err) {
    console.error('Kafka publish error:', err.message);
  }
}

module.exports = { publishTransactionCompleted, publishLowBalance };