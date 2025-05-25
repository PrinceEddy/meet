const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();

// Set up data storage
const dataDir = path.join(__dirname, 'data');
const dataFile = path.join(dataDir, 'subscribers.json');

// Initialize data file
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir);
if (!fs.existsSync(dataFile)) {
  fs.writeFileSync(dataFile, JSON.stringify({
    users: [],
    notifications: []
  }));
}

// Helper functions
const getData = () => JSON.parse(fs.readFileSync(dataFile));
const saveData = (data) => fs.writeFileSync(dataFile, JSON.stringify(data, null, 2));

// Middleware
app.use(express.json());
app.use(express.static('../public')); // Serve frontend in development

// API Routes
app.post('/api/subscribe', (req, res) => {
  const data = getData();
  data.users.push({
    ...req.body,
    createdAt: new Date().toISOString()
  });
  saveData(data);
  res.json({ success: true });
});

app.get('/api/stats', (req, res) => {
  const data = getData();
  res.json({
    totalUsers: data.users.length,
    pushUsers: data.users.filter(u => u.allowPush).length,
    lastNotification: data.notifications[data.notifications.length - 1]
  });
});

app.post('/api/send-alert', (req, res) => {
  const data = getData();
  const notification = {
    message: req.body.message,
    sentAt: new Date().toISOString()
  };
  data.notifications.push(notification);
  saveData(data);
  
  // In production: Add OneSignal API call here
  console.log('Would send push notification:', req.body.message);
  
  res.json({ success: true });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));