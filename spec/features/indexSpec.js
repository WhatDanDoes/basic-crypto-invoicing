const Browser = require('zombie');
const PORT = process.env.NODE_ENV === 'production' ? 3000 : 3001;
Browser.localhost('example.com', PORT);
const app = require('../app');

describe('index', () => {
  const browser = new Browser();

  it('displays the page title set in .env', done => {
    browser.visit('/', (err) => {
      if (err) return done.fail(err);
      browser.assert.success();
      browser.assert.text('#page h1 a', process.env.TITLE);
      done();
    });
  });

  it('displays deposit information with QR code and transaction input form', done => {
    browser.visit('/', (err) => {
      if (err) return done.fail(err);
      browser.assert.success();

      browser.assert.element('#address-qr');
      browser.assert.element('#transaction-confirmation-form');
      browser.assert.element('#transaction-confirmation-form input[name="contact"][type="email"]');
      browser.assert.element('#transaction-confirmation-form input[name="transactionId"]');
      browser.assert.element('#transaction-confirmation-form button[type="submit"]');

      done();
    });
  });

  it('uses the first unused wallet in the database', done => {
    done.fail();
  });

  it('creates a new wallet if their are no unused wallets', done => {
    done.fail();
  });

  describe('transaction confirmation', () => {
    it('provides a friendly confirmation screen', done => {
      done.fail();
    });

    it('sends an email to confirm submission received', done => {
      done.fail();
    });
  });
});
