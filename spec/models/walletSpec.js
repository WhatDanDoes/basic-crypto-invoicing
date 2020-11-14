'use strict';

describe('Wallet', () => {
  const db = require('../../models');
  const Wallet = db.Wallet;

  let wallet;

  beforeEach(done => {
    wallet = new Wallet({
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
      expect(wallet.createdAt).toBe(undefined);
      expect(wallet.updatedAt).toBe(undefined);
      wallet.save().then(obj => {
        expect(wallet.createdAt instanceof Date).toBe(true);
        expect(wallet.updatedAt instanceof Date).toBe(true);
        done();
      }).catch(err => {
        done.fail(err);
      });
    });

    it('requires a symbol', done => {
      wallet.symbol = undefined;

      wallet.save().then(obj => {
        done.fail('This should not have saved');
      }).catch(error => {
        expect(Object.keys(error.errors).length).toEqual(1);
        expect(error.errors['symbol'].message).toEqual('No symbol supplied');
        done();
      });
    });

    it('requires a public address', done => {
      wallet.publicKey = undefined;

      wallet.save().then(obj => {
        done.fail('This should not have saved');
      }).catch(error => {
        expect(Object.keys(error.errors).length).toEqual(1);
        expect(error.errors['publicKey'].message).toEqual('No public address supplied');
        done();
      });
    });

    it('requires a private key', done => {
      wallet.privateKey = undefined;

      wallet.save().then(obj => {
        done.fail('This should not have saved');
      }).catch(error => {
        expect(Object.keys(error.errors).length).toEqual(1);
        expect(error.errors['privateKey'].message).toEqual('No private key supplied');
        done();
      });
    });
  });
});
