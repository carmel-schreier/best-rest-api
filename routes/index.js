var express = require('express');
var router = express.Router();
const mwAuth = require('../middleware/auth');
const auth = require('../controllers/auth');

router.post('/login', auth.login);

//router.get('/logout', mwAuth, function (req, res, next) {
//  return res
//    .clearCookie('access_token')
//    .status(200)
//    .send('Successfully logged out.');
//})


module.exports = router;

//SET DEBUG=best-rest-api:* & npm start