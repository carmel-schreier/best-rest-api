var express = require('express');
var router = express.Router();
const cardsM = require('../controllers/cards');
const mwAuth = require('../middleware/auth');

router.post('/cards', mwAuth, cardsM.addCard);
router.get('/cards/:id', mwAuth, cardsM.getCard);
router.put('/cards/:id', mwAuth, cardsM.editCard);
router.delete('/cards/:id', mwAuth, cardsM.deleteCard);

module.exports = router;