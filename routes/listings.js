const express = require('express');
const router = express.Router();
const authenticateUser = require('../middleware/auth');
const Listing = require('../models/Listing');
const Borrow = require('../models/Borrow');
const User = require('../models/User');

// GET all listings (public)
router.get('/', async (req, res) => {
  try {
    const listings = await Listing.find().sort({ createdAt: -1 });

    const listingWithExtras = await Promise.all(listings.map(async (listing) => {
      const borrow = await Borrow.findOne({
        toolId: listing._id,
        returnedAt: { $exists: false }
      });

      return {
        ...listing.toObject(),
        ownerId: listing.userId.toString(),
        borrowerComment: borrow?.comment || null
      };
    }));

    res.json(listingWithExtras);
  } catch (err) {
    console.error("GET /api/listings failed:", err);
    res.status(500).json({ message: err.message });
  }
});

// POST a new listing (requires login)
router.post('/', authenticateUser, async (req, res) => {
  const { title, description, category, contact } = req.body;

  const newListing = new Listing({
    title,
    description,
    category,
    contact,
    userId: req.user.id,
    available: true
  });

  try {
    await newListing.save();
    res.status(201).json(newListing);
  } catch (err) {
    console.error("POST /api/listings failed:", err);
    res.status(400).json({ message: err.message });
  }
});

// Get current user's listings
router.get('/my', authenticateUser, async (req, res) => {
  try {
    const listings = await Listing.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.json(listings);
  } catch (err) {
    console.error("GET /api/listings/my failed:", err);
    res.status(500).json({ message: err.message });
  }
});

// DELETE a listing by ID (must be owned by logged-in user)
router.delete('/:id', authenticateUser, async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);
    if (!listing) return res.status(404).json({ message: "Listing not found" });

    if (!listing.userId || listing.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized" });
    }

    // ✅ Check for active borrow record
    const activeBorrow = await Borrow.findOne({
      toolId: req.params.id,
      returnedAt: { $exists: false }
    });

    if (activeBorrow) {
      return res.status(400).json({
        message: "This listing is currently borrowed and cannot be deleted until it is returned."
      });
    }

    // ✅ Delete related borrow history
    await Borrow.deleteMany({ toolId: req.params.id });

    // ✅ Delete the listing itself
    await Listing.findByIdAndDelete(req.params.id);

    res.json({ message: "Listing and associated borrow history deleted" });
  } catch (err) {
    console.error("DELETE /api/listings/:id failed:", err);
    res.status(500).json({ message: err.message });
  }
});

// TOGGLE availability of a listing (must be owned by user)
router.put('/:id/availability', authenticateUser, async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);
    if (!listing) return res.status(404).json({ message: "Listing not found" });

    if (!listing.userId || listing.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized" });
    }

    listing.available = !listing.available;
    await listing.save();

    res.json({ message: "Availability updated", available: listing.available });
  } catch (err) {
    console.error("PUT /api/listings/:id/availability failed:", err);
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
