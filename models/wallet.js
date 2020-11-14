'use strict';

module.exports = function(mongoose) {
  const Schema = mongoose.Schema;

  const WalletSchema = new Schema({
  }, {
    timestamps: true
  });

  return WalletSchema;
};
