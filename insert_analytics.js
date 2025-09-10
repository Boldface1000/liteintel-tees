const db = require('./db');

db.run('INSERT OR IGNORE INTO analytics (id, visits, sales, items_sold) VALUES (1, 0, 0, 0)', function(err) {
  if (err) {
    console.error('Error inserting analytics row:', err.message);
  } else {
    console.log('Analytics row inserted or already exists.');
  }
  db.close();
});
