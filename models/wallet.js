'use strict';

module.exports = function(mongoose) {
  const Schema = mongoose.Schema;

  const WalletSchema = new Schema({
    symbol: {
      type: String,
      trim: true,
      required: [true, 'No symbol supplied'],
      empty: [false, 'No symbol supplied'],
    },
    publicKey: {
      type: String,
      trim: true,
      required: [true, 'No public address supplied'],
      empty: [false, 'No public address supplied'],
    },
    privateKey: {
      type: String,
      trim: true,
      required: [true, 'No private key supplied'],
      empty: [false, 'No private key supplied'],
    },
  }, {
    timestamps: true
  });

  return WalletSchema;
};
