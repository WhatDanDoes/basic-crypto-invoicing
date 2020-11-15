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

  describe('transaction ID submission', () => {
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
        browser.assert.text('.alert.alert-success', 'Transaction notification received');
        browser.assert.text('#deposit-instructions header', `A deposit of ${invoice.amount} ${invoice.symbol} to this address is awaiting confirmation`);
        done();
      });
    });

    it('sets the transaction ID in the database', done => {
      expect(invoice.transactionId).toEqual(null);
      browser.pressButton('Submit', err => {
        if (err) return done.fail(err);
        models.Invoice.findOne({ _id: invoice._id }).then(invoice => {
          expect(invoice.transactionId).not.toEqual(null);
          expect(typeof invoice.transactionId).toEqual('string');
          done();
        }).catch(err => {
          done.fail(err);
        });
      });
    });

    describe('transaction confirmation', () => {

      describe('no invoices', () => {
        let agent;
        beforeEach(done => {
          models.mongoose.connection.db.dropDatabase().then(result => {
            models.Agent.create({ email: 'someguy@example.com', password: 'secret' }).then(result => {
              agent = result;

              browser.visit('/login', err => {
                browser.fill('email', agent.email);
                browser.fill('password', 'secret');

                browser.pressButton('Login', err => {
                  if (err) done.fail(err);
                  browser.assert.success();

                  done();
                });
              });
            }).catch(err => {
              done.fail(err);
            });
          }).catch(error => {
            done.fail(error);
          });
        });

        it('shows a message indicating that there are no invoices to confirm', done => {
          browser.visit('/invoice', err => {
            if (err) return done.fail(err);
            browser.assert.text('main h1', 'No invoices');
            done();
          });
        });
      });

      describe('pending invoices', () => {
        let agent;
        beforeEach(done => {
          browser.pressButton('Submit', err => {
            if (err) return done.fail(err);
            browser.assert.success();

            models.Agent.create({ email: 'someguy@example.com', password: 'secret' }).then(result => {
              agent = result;

              done();
            }).catch(err => {
              done.fail(err);
            });
          });
        });

        describe('unauthorized', () => {
          it('redirects to /login', done => {
            browser.visit('/invoice', err => {
              if (err) return done.fail(err);
              browser.assert.text('.alert.alert-danger', 'You need to login first');
              browser.assert.url({ pathname: '/login' });
              done();
            });
          });
        });

        describe('authorized', () => {
          beforeEach(done => {
            browser.visit('/login', err => {
              browser.fill('email', agent.email);
              browser.fill('password', 'secret');

              browser.pressButton('Login', err => {
                if (err) done.fail(err);
                browser.assert.success();

                browser.visit('/invoice', err => {
                  if (err) return done.fail(err);
                  browser.assert.success();
                  done();
                });
              });
            });
          });

          it('displays invoices with UI components', () => {
            browser.assert.element('article.invoice');
            browser.assert.text('article.invoice header', `${invoice.amount} ${invoice.symbol} invoiced to ${invoice.recipient}`);
            browser.assert.element(`article.invoice header a[href="/invoice/${invoice._id}"]`);
            browser.assert.element(`article.invoice aside form.confirm-invoice[action="/invoice/${invoice._id}?_method=PUT"]`);
            browser.assert.text(`article.invoice aside form.confirm-invoice button[type="submit"]`, 'Confirm');
            browser.assert.element(`article.invoice aside form.delete-invoice[action="/invoice/${invoice._id}?_method=DELETE"]`);
            browser.assert.text(`article.invoice aside form.delete-invoice button[type="submit"]`, 'Delete');
          });

          describe('confirming', () => {
            it('lands in the right place', done => {
              browser.pressButton('Confirm', err => {
                if (err) done.fail(err);
                browser.assert.success();

                browser.assert.url({ pathname: '/invoice' });
                done();
              });
            });

            it('updates the database status', done => {
              expect(invoice.confirmed).toBe(false);
              browser.pressButton('Confirm', err => {
                if (err) done.fail(err);
                browser.assert.success();

                model.Invoice.find({}).then(invoices => {
                  expect(invoices.length).toEqual(1);
                  expect(invoices[0].confirmed).toBe(true);

                  done();
                }).catch(err => {
                  done.fail(err);
                });
              });
            });

            it('toggles the confirmed status', done => {
              expect(invoice.confirmed).toBe(false);
              browser.pressButton('Confirm', err => {
                if (err) done.fail(err);
                browser.assert.success();

                model.Invoice.find({}).then(invoices => {
                  expect(invoices.length).toEqual(1);
                  expect(invoices[0].confirmed).toBe(true);

                  browser.pressButton('De-confirm', err => {
                    if (err) done.fail(err);
                    browser.assert.success();

                    model.Invoice.find({}).then(invoices => {
                      expect(invoices.length).toEqual(1);
                      expect(invoices[0].confirmed).toBe(true);

                      done();
                    }).catch(err => {
                      done.fail(err);
                    });
                  }).catch(err => {
                    done.fail(err);
                  });
                }).catch(err => {
                  done.fail(err);
                });
              });
            });

            it('shows the status on the UI', done => {
              browser.pressButton('Confirm', err => {
                if (err) done.fail(err);
                browser.assert.success();

                model.Invoice.find({}).then(invoices => {
                  expect(invoices.length).toEqual(1);
                  expect(invoices[0].confirmed).toBe(true);

                  done();
                }).catch(err => {
                  done.fail(err);
                });
              });
            });
          });

          describe('deleting', () => {
            it('lands in the right place', done => {
              browser.pressButton('Delete', err => {
                if (err) done.fail(err);
                browser.assert.success();

                browser.assert.url({ pathname: '/invoice' });
                done();
              });
            });

            it('displays a confirmation dialog', done => {
              done.fail();
            });

            it('removes the record from the database', done => {
              done.fail();
            });

            it('removes the record from the UI', done => {
              done.fail();
            });
          });
        });
      });
    });
  });
});
