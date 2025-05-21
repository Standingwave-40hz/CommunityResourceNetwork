const express = require('express');
const router = express.Router();
const authenticateUser = require('../middleware/auth');
const Borrow = require('../models/Borrow');
const Listing = require('../models/Listing');
const User = require('../models/User');

// POST /api/borrow/:toolId
router.post('/:toolId', authenticateUser, async (req, res) => {
  try {
    const tool = await Listing.findById(req.params.toolId);
    if (!tool) return res.status(404).json({ message: "Tool not found" });

    const alreadyBorrowed = await Borrow.findOne({
      toolId: req.params.toolId,
      returnedAt: { $exists: false }
    });

    if (alreadyBorrowed) {
      return res.status(400).json({ message: "Tool is already borrowed" });
    }

    const borrow = new Borrow({
      toolId: req.params.toolId,
      userId: req.user.id
    });

    await borrow.save();
    tool.available = false;
    await tool.save();

    res.status(201).json({ message: "Tool borrowed successfully" });
  } catch (err) {
    console.error("Borrow error:", err);
    res.status(500).json({ message: err.message });
  }
});

// PATCH /api/borrow/:toolId/return
router.patch('/:toolId/return', authenticateUser, async (req, res) => {
  try {
    const borrow = await Borrow.findOne({
      toolId: req.params.toolId,
      userId: req.user.id,
      returnedAt: { $exists: false }
    });

    if (!borrow) {
      return res.status(404).json({ message: "No active borrow found for you." });
    }

    borrow.returnedAt = new Date();
    await borrow.save();

    const tool = await Listing.findById(req.params.toolId);
    if (tool) {
      tool.available = true;
      await tool.save();
    }

    res.json({ message: "Tool returned successfully." });
  } catch (err) {
    console.error("Return failed:", err);
    res.status(500).json({ message: err.message });
  }
});

// PATCH /api/borrow/:toolId/owner-return
router.patch('/:toolId/owner-return', authenticateUser, async (req, res) => {
  const { comment } = req.body;

  try {
    const tool = await Listing.findById(req.params.toolId);
    if (!tool) return res.status(404).json({ message: "Tool not found" });

    if (tool.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: "Only the tool owner can return this tool." });
    }

    const borrow = await Borrow.findOne({
      toolId: req.params.toolId,
      returnedAt: { $exists: false }
    });

    if (!borrow) {
      return res.status(404).json({ message: "No active borrow record found." });
    }

    borrow.returnedAt = new Date();
    if (comment) borrow.comment = comment;

    await borrow.save();

    tool.available = true;
    await tool.save();

    res.json({ message: "Tool marked as returned by owner." });
  } catch (err) {
    console.error("Owner return error:", err);
    res.status(500).json({ message: err.message });
  }
});

// PATCH /api/borrow/:toolId/owner-mark-borrowed
router.patch('/:toolId/owner-mark-borrowed', authenticateUser, async (req, res) => {
  const { comment } = req.body;

  try {
    const tool = await Listing.findById(req.params.toolId);
    if (!tool) return res.status(404).json({ message: "Tool not found" });

    if (tool.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: "Only the tool owner can mark this as borrowed." });
    }

    // Prevent duplicate active borrow record
    const alreadyBorrowed = await Borrow.findOne({
      toolId: req.params.toolId,
      returnedAt: { $exists: false }
    });

    if (alreadyBorrowed) {
      return res.status(400).json({ message: "This tool is already borrowed." });
    }

    const borrow = new Borrow({
  toolId: req.params.toolId,
  userId: req.user.id,
  borrowerComment: comment,
  borrowedAt: new Date(),
  returnedAt: undefined // 👈 Ensure this field is not set
});

    await borrow.save();
    tool.available = false;
    await tool.save();

    res.status(200).json({ message: "Tool marked as borrowed by owner." });
  } catch (err) {
    console.error("Owner mark as borrowed error:", err);
    res.status(500).json({ message: err.message });
  }
});

// GET /api/borrow/history/:toolId
router.get('/history/:toolId', async (req, res) => {
  try {
    const records = await Borrow.find({ toolId: req.params.toolId })
      .populate('userId', 'username')
      .sort({ borrowedAt: -1 });

    res.json(records.map(record => ({
      _id: record._id,
      borrower: record.userId.username,
      borrowedAt: record.borrowedAt,
      returnedAt: record.returnedAt || null,
      comment: record.comment || ''
    })));
  } catch (err) {
    console.error("Error fetching borrow history:", err);
    res.status(500).json({ message: "Failed to fetch borrow history." });
  }
});

module.exports = router;
