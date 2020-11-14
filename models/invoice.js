'use strict';

module.exports = function(mongoose) {
  const Schema = mongoose.Schema;

  const InvoiceSchema = new Schema({
    symbol: {
      type: String,
      trim: true,
      required: [true, 'No symbol supplied'],
      empty: [false, 'No symbol supplied'],
    },
    address: {
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
    amount: {
      type: Number,
      required: [true, 'No amount specified'],
      empty: [false, 'No amount specified'],
    },
    recipient: {
      type: String,
      trim: true,
      required: [true, 'Who is the recipient?'],
      empty: [false, 'Who is the recipient?'],
    },
    transactionId: {
      type: String,
      default: null,
    },
    confirmed: {
      type: Boolean,
      default: false,
    },
  }, {
    timestamps: true
  });

  return InvoiceSchema;
};
