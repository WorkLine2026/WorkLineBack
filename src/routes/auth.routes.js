const express = require('express');
const rateLimit = require('express-rate-limit');
const {
  register, verify, resend, login,
  registerPerson, verifyPersonEmail, resendPersonCode, loginPerson,
} = require('../controllers/auth.controller');
const router = express.Router();

const registerLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { message: 'ძალიან ბევრი მოთხოვნა. სცადეთ 15 წუთში' },
});

const verifyLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { message: 'ძალიან ბევრი მცდელობა. სცადეთ მოგვიანებით' },
});

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { message: 'ძალიან ბევრი მცდელობა. სცადეთ მოგვიანებით' },
});

router.post('/register', registerLimiter, register);
router.post('/verify',   verifyLimiter,   verify);
router.post('/resend',   registerLimiter, resend);
router.post('/login',    loginLimiter,    login);
router.post('/person/register',     registerLimiter, registerPerson);
router.post('/person/verify-email', verifyLimiter,   verifyPersonEmail);
router.post('/person/resend-code',  registerLimiter, resendPersonCode);
router.post('/person/login',        loginLimiter,    loginPerson);

module.exports = router;