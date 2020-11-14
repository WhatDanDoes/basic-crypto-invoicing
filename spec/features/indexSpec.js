const Browser = require('zombie');
const PORT = process.env.NODE_ENV === 'production' ? 3000 : 3001;
Browser.localhost('example.com', PORT);
const app = require('../../app');
const models = require('../../models');

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

  it('displays a invoice creation form', done => {
    browser.visit('/', (err) => {
      if (err) return done.fail(err);
      browser.assert.success();

      browser.assert.element('#invoice-form');
      browser.assert.element('#invoice-form input[name="recipient"][type="text"]');
      browser.assert.element('#invoice-form select[name="symbol"]');
      browser.assert.element('#invoice-form input[name="amount"][type="number"]');
      browser.assert.element('#invoice-form button[type="submit"]');

      done();
    });
  });

  it('displays the configured currency options', done => {
    process.env.CURRENCIES = 'BTC,BCH,DOGE';
    browser.visit('/', (err) => {
      if (err) return done.fail(err);
      browser.assert.success();

      browser.assert.elements('#invoice-form select[name="symbol"] option', 3);
      browser.assert.element('#invoice-form select[name="symbol"] option[value="BTC"]');
      browser.assert.element('#invoice-form select[name="symbol"] option[value="BCH"]');
      browser.assert.element('#invoice-form select[name="symbol"] option[value="DOGE"]');

      done();
    });
  });

  describe('invoice creation', () => {

    beforeEach(done => {
      process.env.CURRENCIES = 'BTC,BCH,DOGE';
      browser.visit('/', (err) => {
        if (err) return done.fail(err);
        browser.assert.success();

        browser.fill('#invoice-form input[name="recipient"]', 'Some Guy');
        browser.select('#invoice-form select[name="symbol"]', 'BTC');
        browser.fill('#invoice-form input[name="amount"]', 0.12);

        done();
      });
    });

    afterEach(done => {
      models.mongoose.connection.db.dropDatabase().then(result => {
        done();
      }).catch(err => {
        done.fail(err);
      });
    });

    it('lands in the right spot', done => {
      browser.pressButton('Submit', err => {
        if (err) return done.fail(err);
        browser.assert.success();

        models.Invoice.find({}).then(invoices => {
          expect(invoices.length).toEqual(1);
          browser.assert.url({pathname: `/${invoice[0]._id}` });

          done();
        }).catch(err => {
          done.fail(err);
        });
      });
    });

    it('displays the payment request form', done => {
      browser.pressButton('Submit', err => {
        if (err) return done.fail(err);
        browser.assert.success();

        browser.assert.element('#public-qr');
        browser.assert.element('#transaction-confirmation-form');
        browser.assert.element('#transaction-confirmation-form input[name="contact"][type="email"]');
        browser.assert.element('#transaction-confirmation-form input[name="transactionId"]');
        browser.assert.element('#transaction-confirmation-form button[type="submit"]');

        done();
      });
    });

    it('creates an invoice record in the database', done => {
      models.Invoice.find({}).then(invoices => {
        expect(invoices.length).toEqual(0);

        browser.pressButton('Submit', err => {
          if (err) return done.fail(err);
          browser.assert.success();

          models.Invoice.find({}).then(invoices => {
            expect(invoices.length).toEqual(1);
            expect(invoices[0].symbol).toEqual('BTC');
            expect(invoices[0].publicKey).toBeDefined();
            expect(invoices[0].privateKey).toBeDefined();
            expect(invoices[0].amountDue).toEqual(0.12);
            expect(invoices[0].recipient).toEqual('Some Guy');
            expect(invoices[0].transactionId).not.toBeDefined();

            done();
          }).catch(err => {
            done.fail(err);
          });
        });
      }).catch(err => {
        done.fail(err);
      });
    });
  });
});
