const express = require('express');
const router = express.Router();
// ✅ Destructured forgotPassword cleanly out of updated controller file
const { register, login, forgotPassword } = require('../controllers/authController');

router.post('/register', register);
router.post('/login', login);

// ✅ DAY 14 ROUTE: Expose the security link generator endpoint
router.post('/forgot-password', forgotPassword);

module.exports = router;
