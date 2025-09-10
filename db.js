const sqlite3 = require('sqlite3').verbose();

// Create database connection
const db = new sqlite3.Database('./liteintel.db', (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
  } else {
    console.log('Connected to SQLite database.');
  }
});

// Create tables
db.serialize(() => {
  // Products table
  db.run(`
    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      price REAL NOT NULL,
      image TEXT,
      sizes TEXT,
      quantity INTEGER NOT NULL
    )
  `);

  // Orders table
  db.run(`
    CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      shipping_info TEXT NOT NULL,
      items TEXT NOT NULL,
      total REAL NOT NULL,
      status TEXT DEFAULT 'pending',
      order_date TEXT NOT NULL
    )
  `);

  // Analytics table (single row for totals)
  db.run(` 
    CREATE TABLE IF NOT EXISTS analytics (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      visits INTEGER DEFAULT 0,
      sales REAL DEFAULT 0,
      items_sold INTEGER DEFAULT 0
    )
  `, (err) => {
    if (err) {
      console.error('Error creating analytics table:', err.message);
    } else {
      console.log('Analytics table created or already exists.');
    }
  });
});

// Export the database connection
module.exports = db;
