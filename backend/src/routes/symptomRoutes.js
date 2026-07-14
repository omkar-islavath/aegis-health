const express = require('express');
const router = express.Router();
const { createLog, getLogs, getEpisodes, resolveEpisode } = require('../controllers/symptomController');
const authenticateToken = require('../middleware/authMiddleware');

router.post('/logs', authenticateToken, createLog);
router.get('/logs', authenticateToken, getLogs);
router.get('/episodes', authenticateToken, getEpisodes);
router.put('/episodes/:id/resolve', authenticateToken, resolveEpisode);

module.exports = router;
