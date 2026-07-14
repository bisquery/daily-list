import Dexie from 'dexie';

// Initialize the database
export const db = new Dexie('DailyListDB');

// Define the schema:
// - items: contains wishlist/history items
// - settings: contains configurations like PIN password
db.version(1).stores({
  items: '++id, category, status, createdAt',
  settings: 'key'
});

// Helper functions for settings
export async function getSetting(key, defaultValue = null) {
  const record = await db.settings.get(key);
  return record ? record.value : defaultValue;
}

export async function setSetting(key, value) {
  await db.settings.put({ key, value });
}
