const express = require('express');
const router = express.Router();
const investmentController = require('../controllers/investmentController');

router.get('/', investmentController.getAll);
router.get('/portfolio', investmentController.getPortfolio);
router.get('/:id', investmentController.getById);
router.post('/', investmentController.create);
router.put('/:id', investmentController.update);
router.delete('/:id', investmentController.remove);

module.exports = router;
