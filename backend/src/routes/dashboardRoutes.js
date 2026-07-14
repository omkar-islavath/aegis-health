const express = require('express');
const router = express.Router();
const { getStatus, getTrends, getRules, createRule, toggleRule, deleteRule } = require('../controllers/dashboardController');
const authenticateToken = require('../middleware/authMiddleware');

router.get('/status', authenticateToken, getStatus);
router.get('/trends', authenticateToken, getTrends);

// Admin Triage Rules management
router.get('/rules', authenticateToken, getRules);
router.post('/rules', authenticateToken, createRule);
router.put('/rules/:id/toggle', authenticateToken, toggleRule);
router.delete('/rules/:id', authenticateToken, deleteRule);

module.exports = router;
