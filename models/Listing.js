const mongoose = require('mongoose');

const listingSchema = new mongoose.Schema({
    title: String,
    description: String,
    category: String,
    contact: String,
    available: { type: Boolean, default: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Listing', listingSchema);
