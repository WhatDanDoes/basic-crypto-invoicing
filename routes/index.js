const express = require('express');
const router = express.Router();

const symbols = process.env.CURRENCIES.split(',');

/**
 * GET /
 */
router.get('/', (req, res, next) => {
  res.render('index', { symbols: symbols, messages: req.flash() });
});

module.exports = router;
