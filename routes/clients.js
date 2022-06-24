var express = require('express');
var router = express.Router();
const cm = require('../controllers/clients');
const mwAuth = require('../middleware/auth');



router.post('/clients', cm.addClient);
router.get('/clients/me', mwAuth, cm.getClientDetails); //id in the request body must match the id encoded in the jwt token
router.get('/clients/:id', mwAuth, cm.getClientCards);

module.exports = router;