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
  });
});
