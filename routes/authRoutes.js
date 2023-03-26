const express = require('express');
const authController = require('../controllers/authController');

const router = express.Router();

const auth = require('../middleware/auth');

router.post('/register', authController.register);
router.post('/login', authController.login);
router.get('/me', auth.protect, authController.getMe);
router.put('/updatedetails', auth.protect, authController.updateDetails);
router.put('/updatepassword', auth.protect, authController.updatePassword);
router.post('/forgotpassword', authController.forgotPassword);
router.put('/resetpassword/:resettoken', authController.resetPassword);

module.exports = router;
