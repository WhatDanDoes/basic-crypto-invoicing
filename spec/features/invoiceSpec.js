const Browser = require('zombie');
const PORT = process.env.NODE_ENV === 'production' ? 3000 : 3001;
Browser.localhost('example.com', PORT);
const app = require('../../app');
const models = require('../../models');

describe('invoice', () => {
  const browser = new Browser();

  let invoice;
  beforeEach(done => {
    process.env.CURRENCIES = 'BTC,BCH,DOGE';

    browser.visit('/', (err) => {
      if (err) return done.fail(err);
      browser.assert.success();

      browser.fill('#invoice-form input[name="recipient"]', 'Some Guy');
      browser.select('#invoice-form select[name="symbol"]', 'BTC');
      browser.fill('#invoice-form input[name="amount"]', 0.12);
      browser.pressButton('Submit', err => {
        if (err) return done.fail(err);
        browser.assert.success();

        models.Invoice.find({}).then(invoices => {
          expect(invoices.length).toEqual(1);
          invoice = invoices[0];

          done();
        }).catch(err => {
          done.fail(err);
        });
      });
    });
  });

  afterEach(done => {
    models.mongoose.connection.db.dropDatabase().then(result => {
      done();
    }).catch(err => {
      done.fail(err);
    });
  });

  it('lands in the right spot', () => {
    browser.assert.url({pathname: `/invoice/${invoice._id}` });
  });

  it('displays payment information with QR code and transaction ID input form', () => {
    browser.assert.element('#public-qr');
    browser.assert.element('#transaction-confirmation-form');
    browser.assert.element('#transaction-confirmation-form input[name="contact"][type="email"]');
    browser.assert.element('#transaction-confirmation-form input[name="transactionId"]');
    browser.assert.element('#transaction-confirmation-form button[type="submit"]');
  });

  describe('transaction confirmation', () => {
    it('lands in the right spot', done => {
      done.fail();
    });

    it('provides a friendly confirmation screen', done => {
      browser.assert.text('.alert.alert-success', 'Transaction notification received');
      done.fail();
    });

    it('sets the transaction ID in the database', done => {
      done.fail();
    });
  });
});
