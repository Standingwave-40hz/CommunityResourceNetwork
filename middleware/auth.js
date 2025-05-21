const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || "defaultsecret";

function authenticateUser(req, res, next) {
    const token = req.cookies.token;
    if (!token) return res.status(401).json({ message: "Not authenticated" });

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded; // { id, username }
        next();
    } catch (err) {
        return res.status(403).json({ message: "Invalid token" });
    }
}

module.exports = authenticateUser;
