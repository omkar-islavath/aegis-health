const express = require('express');
const router = express.Router();
const { createLog, getLogs, deleteLog } = require('../controllers/medicineController');
const authenticateToken = require('../middleware/authMiddleware');

router.post('/', authenticateToken, createLog);
router.get('/', authenticateToken, getLogs);
router.delete('/:id', authenticateToken, deleteLog);

module.exports = router;
