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
    browser.assert.element('#deposit-instructions');
    browser.assert.text('#deposit-instructions header', `Deposit ${invoice.amount} ${invoice.symbol} to this address`);
    browser.assert.element('#deposit-instructions section#qr img');
    browser.assert.text('#deposit-instructions section#qr', 'Submit the transaction ID and payment will be accepted as soon as it is confirmed.');

    browser.assert.element('#transaction-confirmation-form');
    browser.assert.element(`form#transaction-confirmation-form[action="/invoice/${invoice._id}?_method=PATCH"]`);
    browser.assert.element('#transaction-confirmation-form input[name="transactionId"][type="text"]');
    browser.assert.element('#transaction-confirmation-form button[type="submit"]');
  });

  describe('transaction confirmation', () => {
    beforeEach(() => {
      browser.fill('#transaction-confirmation-form input[name="transactionId"]', 'some-transaction-id');
    });

    it('lands in the right spot', done => {
      browser.pressButton('Submit', err => {
        if (err) return done.fail(err);
        browser.assert.url({pathname: `/invoice/${invoice._id}` });
        done();
      });
    });

    it('provides a friendly confirmation screen and displays processing status', done => {
      browser.pressButton('Submit', err => {
        if (err) return done.fail(err);
        browser.assert.text('.alert.alert-success', 'Transaction notification received and is now being verified');
        browser.assert.text('#deposit-instructions header', `A deposit of ${invoice.amount} ${invoice.symbol} to this address is awaiting confirmation`);
        done();
      });
    });

    it('sets the transaction ID in the database', done => {
      expect(invoice.transactionId).toEqual(null);
      browser.pressButton('Submit', err => {
        if (err) return done.fail(err);
        models.Invoice.findOne({ _id: invoice._id }).then(inv => {
          expect(invoice.transactionId).not.toEqual(null);
          expect(typeof invoice.transactionId).toEqual('string');
          done();
        }).catch(err => {
          done.fail(err);
        });
      });
    });
  });
});
