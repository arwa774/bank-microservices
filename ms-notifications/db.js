let db = null;

async function initDB() {
  const { createRxDatabase } = require('rxdb');
  const { getRxStorageMemory } = require('rxdb/plugins/storage-memory');

  db = await createRxDatabase({
    name: 'notifications_db',
    storage: getRxStorageMemory()
  });

  await db.addCollections({
    notifications: {
      schema: {
        version: 0,
        primaryKey: 'id',
        type: 'object',
        properties: {
          id:      { type: 'string', maxLength: 100 },
          userId:  { type: 'string' },
          message: { type: 'string' },
          read:    { type: 'boolean' },
          date:    { type: 'string' }
        },
        required: ['id', 'userId', 'message', 'read', 'date']
      }
    }
  });

  return db;
}

function getDB() { return db; }

module.exports = { initDB, getDB };