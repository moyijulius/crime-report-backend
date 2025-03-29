const jwt = require('jsonwebtoken');

function authenticateToken(req, res, next) {
  // Get the Authorization header
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Extract token from "Bearer <token>"

  // Check if token is provided
  if (!token) {
    return res.status(401).json({ error: 'Access denied. No token provided.' });
  }

  // Verify the token
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }

    // Attach user information to request object
    req.user = user;
    next();
  });
}

module.exports = authenticateToken;
