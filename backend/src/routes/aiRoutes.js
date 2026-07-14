const express = require('express');
const router = express.Router();
const { generateSummary, getSummaries } = require('../controllers/aiController');
const authenticateToken = require('../middleware/authMiddleware');

router.post('/summary', authenticateToken, generateSummary);
router.get('/summaries', authenticateToken, getSummaries);

module.exports = router;
