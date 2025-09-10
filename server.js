const express = require('express');
const multer = require('multer');
const path = require('path');
const cors = require('cors');
const db = require('./db');
const nodemailer = require('nodemailer');
const twilio = require('twilio');

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'images/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

// Email transporter setup
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'customeragent404@gmail.com',
    pass: 'Udumebrayeeferide2'
  }
});

// Twilio setup
const twilioClient = twilio('ACda1a1f8987f4c8d240ff905059fff15c', '07b38cc24c39885cfcdfac0191a6d388');
const fromNumber = '+16626743851';

// Admin details
const adminEmail = 'customeragent404@gmail.com';
const adminPhone = '+2347082335454';

// Function to send email notification
async function sendEmailNotification(orderId, total) {
  const mailOptions = {
    from: 'customeragent404@gmail.com',
    to: adminEmail,
    subject: 'New Order Placed',
    text: `A new order has been placed.\nOrder ID: ${orderId}\nTotal: $${total.toFixed(2)}`
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Email notification sent');
  } catch (error) {
    console.error('Error sending email:', error);
  }
}

// Function to send SMS notification
async function sendSMSNotification(orderId, total) {
  try {
    await twilioClient.messages.create({
      body: `New order placed. ID: ${orderId}, Total: $${total.toFixed(2)}`,
      from: fromNumber,
      to: adminPhone
    });
    console.log('SMS notification sent');
  } catch (error) {
    console.error('Error sending SMS:', error);
  }
}

// Analytics endpoints
app.get('/api/analytics', (req, res) => {
  db.get('SELECT * FROM analytics WHERE id = 1', (err, row) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      if (row) {
        // Fix JSON keys missing commas
        const fixedRow = {
          id: row.id,
          visits: row.visits,
          sales: row.sales,
          items_sold: row.items_sold
        };
        res.json(fixedRow);
      } else {
        res.json({ visits: 0, sales: 0, items_sold: 0 });
      }
    }
  });
});

app.post('/api/analytics/visit', (req, res) => {
  db.run('UPDATE analytics SET visits = visits + 1 WHERE id = 1', (err) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      res.json({ message: 'Visit logged' });
    }
  });
});

app.post('/api/analytics/sale', (req, res) => {
  const { amount, items } = req.body;
  db.run('UPDATE analytics SET sales = sales + ?, items_sold = items_sold + ? WHERE id = 1', [amount, items], (err) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      res.json({ message: 'Sale logged' });
    }
  });
});

// Products endpoints
app.get('/api/products', (req, res) => {
  db.all('SELECT * FROM products', (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      rows.forEach(row => {
        if (row.sizes) {
          row.sizes = JSON.parse(row.sizes);
        }
      });
      res.json(rows);
    }
  });
});

app.post('/api/products', upload.single('image'), (req, res) => {
  const { name, price, sizes, quantity } = req.body;
  const image = req.file ? req.file.filename : null;

  // Validate required fields
  if (!name || !price || !quantity || !image) {
    // Also check for image because it's required in admin.js
    return res.status(400).json({ error: 'Name, price, quantity, and image are required' });
  }

  // Parse the values correctly
  const parsedPrice = parseFloat(price);
  const parsedQuantity = parseInt(quantity);
  const sizesArray = sizes ? sizes.split(',') : [];
  const sizesJson = JSON.stringify(sizesArray);

  // Check for parsing errors
  if (isNaN(parsedPrice) || isNaN(parsedQuantity)) {
    return res.status(400).json({ error: 'Invalid price or quantity' });
  }

  db.run('INSERT INTO products (name, price, image, sizes, quantity) VALUES (?, ?, ?, ?, ?)',
    [name, parsedPrice, image, sizesJson, parsedQuantity], function(err) {
      if (err) {
        // Log the actual database error to the console for debugging
        console.error('Database Error:', err.message);
        res.status(500).json({ error: 'Internal Server Error' });
      } else {
        res.json({ id: this.lastID, message: 'Product added' });
      }
    });
});

// Orders endpoints
app.get('/api/orders', (req, res) => {
  db.all('SELECT * FROM orders', (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      rows.forEach(row => {
        row.shipping_info = JSON.parse(row.shipping_info);
        row.items = JSON.parse(row.items);
      });
      res.json(rows);
    }
  });
});

app.post('/api/orders', (req, res) => {
  const { shippingInfo, items, total } = req.body;

  if (!shippingInfo || !items || !total) {
    return res.status(400).json({ error: 'Shipping info, items, and total are required' });
  }

  const shippingJson = JSON.stringify(shippingInfo);
  const itemsJson = JSON.stringify(items);

  db.run('INSERT INTO orders (shipping_info, items, total, order_date) VALUES (?, ?, ?, ?)',
    [shippingJson, itemsJson, parseFloat(total), new Date().toISOString()], function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
      } else {
        // Log sale analytics
        const itemsCount = items.reduce((sum, item) => sum + item.quantity, 0);
        db.run('UPDATE analytics SET sales = sales + ?, items_sold = items_sold + ? WHERE id = 1', [total, itemsCount]);
        res.json({ id: this.lastID, message: 'Order placed' });

        // Send notifications
        const orderId = this.lastID;
        sendEmailNotification(orderId, parseFloat(total));
        sendSMSNotification(orderId, parseFloat(total));
      }
    });
});

app.put('/api/orders/:id/status', (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!status) {
    return res.status(400).json({ error: 'Status is required' });
  }

  db.run('UPDATE orders SET status = ? WHERE id = ?', [status, id], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
    } else if (this.changes === 0) {
      res.status(404).json({ error: 'Order not found' });
    } else {
      res.json({ message: 'Order status updated' });
    }
  });
});

// --- Serve static files as the last resort ---
app.use(express.static(path.join(__dirname)));

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
