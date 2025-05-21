const mongoose = require('mongoose');

const borrowSchema = new mongoose.Schema({
  toolId: { type: mongoose.Schema.Types.ObjectId, ref: 'Listing', required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  borrowedAt: { type: Date, default: Date.now },
  returnedAt: { type: Date },
  comment: { type: String }
});

module.exports = mongoose.model('Borrow', borrowSchema);
