const express = require('express');
const router = express.Router();
const models = require('../models');
const cw = require('crypto-wallets');
const qrcode = require('qrcode');

/**
 * GET /invoice
 */
router.get('/', (req, res, next) => {
  if (!req.user) {
    req.flash('error', 'You need to login first');
    return res.redirect('/login');
  }

  models.Invoice.find({}).then(invoices => {

    res.render('invoice/index', { invoices: invoices, messages: req.flash(), agent: req.user });

  }).catch(err => {
    req.flash('error', err.message);
    res.redirect('/');
  });
});


/**
 * GET /invoice/:id
 */
router.get('/:id', (req, res, next) => {
  models.Invoice.findOne({ _id: req.params.id}).then(invoice => {

    qrcode.toDataURL(invoice.address, (err, url) => {
      if (err) {
        req.flash('error', err.message);
        return res.redirect('/');
      }
      res.render('invoice/show', { invoice: invoice, messages: req.flash(), qr: url, agent: req.user });
    });

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


/**
 * PATCH /invoice/:id
 */
router.patch('/:id', (req, res, next) => {
  models.Invoice.findOne({ _id: req.params.id}).then(invoice => {

    invoice.transactionId = req.body.transactionId;

    invoice.save().then(invoice => {
      req.flash('success', 'Transaction notification received');
      res.redirect(`/invoice/${invoice._id}`);
    }).catch(err => {
      req.flash('error', err.message);
      res.redirect('/');
    });
  }).catch(err => {
    req.flash('error', err.message);
    res.redirect('/');
  });
});

/**
 * PUT /invoice/:id
 */
router.put('/:id', (req, res, next) => {
  if (!req.user) {
    req.flash('error', 'You need to login first');
    return res.status(403).json({ message: 'You need to login first' });
  }

  models.Invoice.findOne({ _id: req.params.id}).then(invoice => {

    invoice.confirmed = !invoice.confirmed;

    invoice.save().then(invoice => {
      req.flash('success', 'Transaction updated');
      res.redirect(`/invoice`);
    }).catch(err => {
      req.flash('error', err.message);
      res.redirect('/');
    });
  }).catch(err => {
    req.flash('error', err.message);
    res.redirect('/');
  });
});

/**
 * DELETE /invoice/:id
 */
router.delete('/:id', (req, res, next) => {
  if (!req.user) {
    req.flash('error', 'You need to login first');
    return res.status(403).json({ message: 'You need to login first' });
  }

  models.Invoice.deleteOne({ _id: req.params.id }).then(results => {
    req.flash('success', 'Invoice deleted');
    res.redirect('/invoice');
  }).catch(error => {
    req.flash('error', error.message);
    res.redirect('/invoice');
  });
});


module.exports = router;
