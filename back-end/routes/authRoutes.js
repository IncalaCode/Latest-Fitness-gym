const express = require('express');
const router = express.Router();
const loginController = require('../controllers/loginController');


router.post('/login', loginController.login);
router.get("/token-refresh/:token" ,loginController.token_refresh)
  

module.exports = router;