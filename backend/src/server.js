const express = require('express');
const cors = require('cors');
require('dotenv').config();

const sequelize = require('./config/db');
const initDatabase = require('./config/initDb');
require('./models'); // Imports index.js to configure Sequelize associations

// Routes
const authRoutes = require('./routes/authRoutes');
const symptomRoutes = require('./routes/symptomRoutes');
const medicineRoutes = require('./routes/medicineRoutes');
const aiRoutes = require('./routes/aiRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');

// Middleware
const errorHandler = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 5000;

// Setup Middleware
app.use(cors());
app.use(express.json());

// Bind Routes
app.use('/api/auth', authRoutes);
app.use('/api/symptoms', symptomRoutes);
app.use('/api/medicines', medicineRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Health Check Endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date(),
    database: sequelize.options.dialect
  });
});

// Root route
app.get('/', (req, res) => {
  res.send('Health Monitoring & Triage Platform API is running.');
});

// Centralized error handler
app.use(errorHandler);

// Connect DB & Sync
const startServer = async () => {
  try {
    await initDatabase();
    await sequelize.authenticate();
    console.log('PostgreSQL database connection established successfully.');

    // Sync database models (alter: true updates schemas in development)
    await sequelize.sync({ alter: true });
    console.log('All database models synchronized successfully.');

    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Unable to connect to the database or start the server:', error);
    process.exit(1);
  }
};

startServer();
