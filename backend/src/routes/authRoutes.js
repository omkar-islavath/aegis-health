const express = require('express');
const router = express.Router();
const { register, login, profile, forgotPassword, resetPassword } = require('../controllers/authController');
const authenticateToken = require('../middleware/authMiddleware');

router.post('/register', register);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.get('/profile', authenticateToken, profile);

module.exports = router;
