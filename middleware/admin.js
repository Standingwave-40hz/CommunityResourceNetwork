const User = require('../models/User');

module.exports = async function requireAdmin(req, res, next) {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    // Look up user in database to ensure isAdmin is up to date
    const user = await User.findById(req.user.id);

    if (!user) {
      console.warn(`Admin middleware: No user found for ID ${req.user.id}`);
      return res.status(404).json({ message: "User not found" });
    }

    if (!user.isAdmin) {
      console.warn(`Admin middleware: User ${user.username} is not an admin`);
      return res.status(403).json({ message: "Admin access required" });
    }

    // Pass user object along in case needed downstream
    req.adminUser = user;
    next();
  } catch (err) {
    console.error("Admin middleware error:", err);
    res.status(500).json({ message: "Internal server error in admin check." });
  }
};
