const express = require('express');
const router = express.Router();
const models = require('../models');
const cw = require('crypto-wallets');

/**
 * GET /invoice/:id
 */
router.get('/:id', (req, res, next) => {
  models.Invoice.findOne({ _id: req.params.id}).then(invoice => {
    res.render('invoice/show', { invoice: invoice, messages: req.flash() });
  }).catch(err => {
    req.flash('error', err.message);
    res.redirect('/');
  });
});


/**
 * POST /invoice
 */
router.post('/', (req, res, next) => {
  const wallet = cw.generateWallet(req.body.symbol)
  models.Invoice.create({...req.body, address: wallet.address, privateKey: wallet.privateKey }).then(invoice => {
    res.redirect(`/invoice/${invoice._id}`);
  }).catch(err => {
    req.flash('error', err.message);
    res.redirect('/');
  });
});

module.exports = router;