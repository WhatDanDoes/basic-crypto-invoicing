const express = require('express');
const router = express.Router();
const passport = require('passport');

const symbols = process.env.CURRENCIES.split(',');

/**
 * GET /
 */
router.get('/', (req, res, next) => {
  res.render('index', { symbols: symbols, messages: req.flash(), agent: req.user });
});

/**
 * GET /login
 */
router.get('/login', (req, res, next) => {
  if (req.user) {
    return res.redirect('/invoice');
  }
  res.render('login', { messages: req.flash(), agent: req.user });
});

/**
 * POST /login
 */
router.post('/login', (req, res, next) => {
  passport.authenticate('local', (err, user, info) => {
    if (err) {
      return next(err);
    }
    if (!user) {
      if (req.accepts('text/html')) {
        req.flash('error', 'Invalid email or password');
        return res.redirect('/');
      }
      return res.status(401).json({message: 'Invalid email or password'});
    }
    req.logIn(user, err => {
      if (err) {
        return next(err);
      }
      req.flash('info', 'Hello, ' + req.user.email + '!');
      res.redirect(`/invoice`);
    });
  })(req, res, next);
});

/**
 * GET /logout
 */
router.get('/logout', (req, res) => {
  req.logout();
  req.session = null;
  return res.redirect('/');
});

module.exports = router;
