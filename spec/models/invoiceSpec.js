'use strict';

describe('Invoice', () => {
  const db = require('../../models');
  const Invoice = db.Invoice;

  let invoice;

  beforeEach(done => {
    invoice = new Invoice({
      symbol: 'BTC',
      publicKey: 'some-pseudo-random-public-address',
      privateKey: 'some-pseudo-random-private-key',
      amountDue: '1.0001',
      recipient: 'Some Name or Email',
    });
    done();
  });

  afterEach(done => {
    db.mongoose.connection.db.dropDatabase().then(result => {
      done();
    }).catch(err => {
      done.fail(err);
    });
  });

  describe('basic validation', () => {
    it('sets the createdAt and updatedAt fields', done => {
      expect(invoice.createdAt).toBe(undefined);
      expect(invoice.updatedAt).toBe(undefined);
      invoice.save().then(obj => {
        expect(invoice.createdAt instanceof Date).toBe(true);
        expect(invoice.updatedAt instanceof Date).toBe(true);
        done();
      }).catch(err => {
        done.fail(err);
      });
    });

    it('requires a symbol', done => {
      invoice.symbol = undefined;

      invoice.save().then(obj => {
        done.fail('This should not have saved');
      }).catch(error => {
        expect(Object.keys(error.errors).length).toEqual(1);
        expect(error.errors['symbol'].message).toEqual('No symbol supplied');
        done();
      });
    });

    it('requires a public address', done => {
      invoice.publicKey = undefined;

      invoice.save().then(obj => {
        done.fail('This should not have saved');
      }).catch(error => {
        expect(Object.keys(error.errors).length).toEqual(1);
        expect(error.errors['publicKey'].message).toEqual('No public address supplied');
        done();
      });
    });

    it('requires a private key', done => {
      invoice.privateKey = undefined;

      invoice.save().then(obj => {
        done.fail('This should not have saved');
      }).catch(error => {
        expect(Object.keys(error.errors).length).toEqual(1);
        expect(error.errors['privateKey'].message).toEqual('No private key supplied');
        done();
      });
    });

    it('requires an amount due', done => {
      invoice.amountDue = undefined;

      invoice.save().then(obj => {
        done.fail('This should not have saved');
      }).catch(error => {
        expect(Object.keys(error.errors).length).toEqual(1);
        expect(error.errors['amountDue'].message).toEqual('No amount due specified');
        done();
      });
    });

    it('requires an amount due', done => {
      invoice.amountDue = undefined;

      invoice.save().then(obj => {
        done.fail('This should not have saved');
      }).catch(error => {
        expect(Object.keys(error.errors).length).toEqual(1);
        expect(error.errors['amountDue'].message).toEqual('No amount due specified');
        done();
      });
    });

    it('requires a recipient', done => {
      invoice.recipient = undefined;

      invoice.save().then(obj => {
        done.fail('This should not have saved');
      }).catch(error => {
        expect(Object.keys(error.errors).length).toEqual(1);
        expect(error.errors['recipient'].message).toEqual('Who is the recipient?');
        done();
      });
    });

    it('initializes a null transaction ID', done => {
      invoice.save().then(obj => {
        expect(invoice.transactionId).toEqual(null);
        invoice.transactionId = 'some-transaction-id';
        invoice.save().then(obj => {
          expect(invoice.transactionId).toEqual('some-transaction-id');
          done();
        }).catch(err => {
          done.fail(err);
        });
      }).catch(err => {
        done.fail(err);
      });
    });
  });
});
