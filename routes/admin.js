const express = require('express');
const router = express.Router();
const authenticateUser = require('../middleware/auth');
const requireAdmin = require('../middleware/admin');
const Listing = require('../models/Listing');
const Borrow = require('../models/Borrow');
const User = require('../models/User');

// View all users
router.get('/users', authenticateUser, requireAdmin, async (req, res) => {
  const users = await User.find().select('-password');
  res.json(users);
});

// Delete user and their listings
router.delete('/users/:id', authenticateUser, requireAdmin, async (req, res) => {
  const userId = req.params.id;

  const listings = await Listing.find({ userId });
  const listingIds = listings.map(l => l._id);
  await Borrow.deleteMany({ toolId: { $in: listingIds } });
  await Listing.deleteMany({ userId });
  await User.findByIdAndDelete(userId);

  res.json({ message: "User and all associated data deleted." });
});

// Promote a user to admin
router.patch('/users/:id/promote', authenticateUser, requireAdmin, async (req, res) => {
  const user = await User.findByIdAndUpdate(req.params.id, { isAdmin: true }, { new: true });
  res.json({ message: `${user.username} promoted to admin.` });
});

// Disable a user (soft delete)
router.patch('/users/:id/disable', authenticateUser, requireAdmin, async (req, res) => {
  const user = await User.findByIdAndUpdate(req.params.id, { isDisabled: true }, { new: true });
  res.json({ message: `${user.username} has been disabled.` });
});

// View all listings
router.get('/listings', authenticateUser, requireAdmin, async (req, res) => {
  const listings = await Listing.find().sort({ createdAt: -1 });
  res.json(listings);
});

// Delete any listing by ID
router.delete('/listings/:id', authenticateUser, requireAdmin, async (req, res) => {
  await Borrow.deleteMany({ toolId: req.params.id });
  await Listing.findByIdAndDelete(req.params.id);
  res.json({ message: "Listing deleted by admin." });
});

// Export all users as CSV
router.get('/export/users', authenticateUser, requireAdmin, async (req, res) => {
  const users = await User.find().select('-password');
  const csv = users.map(u => `${u._id},${u.username},${u.isAdmin},${u.isDisabled}`).join('\n');
  res.setHeader('Content-Type', 'text/csv');
  res.send(`id,username,isAdmin,isDisabled\n${csv}`);
});

// Export all listings as CSV
router.get('/export/listings', authenticateUser, requireAdmin, async (req, res) => {
  const listings = await Listing.find();
  const csv = listings.map(l =>
    `${l._id},"${l.title.replace(/"/g, '""')}","${l.description.replace(/"/g, '""')}",${l.category},${l.contact}`
  ).join('\n');
  res.setHeader('Content-Type', 'text/csv');
  res.send(`id,title,description,category,contact\n${csv}`);
});

module.exports = router;
