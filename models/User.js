const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  acceptedTerms: { type: Boolean, default: false },
  isAdmin: { type: Boolean, default: false },
  isDisabled: { type: Boolean, default: false }, // for soft delete
  contact: { type: String, default: '' }
});


module.exports = mongoose.model('User', userSchema);
