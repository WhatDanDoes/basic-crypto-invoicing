'use strict';

describe('Wallet', () => {
  const db = require('../../models');
  const Wallet = db.Wallet;

  let wallet;

  beforeEach(done => {
    wallet = new Wallet({});
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
  });
});
