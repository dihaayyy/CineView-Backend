const jwt = require("jsonwebtoken");
const { SECRET_KEY } = require("../config/config");

function verifyToken(req, res, next) {
  const authHeader = req.headers["authorization"];

  console.log("Authorization Header:", authHeader); // <-- Tambahkan ini

  const token = authHeader && authHeader.split(" ")[1];

  console.log("Token to verify:", token); // <-- Tambahkan ini

  if (!token) {
    console.log("Token not found in header"); // <-- Tambahkan ini
    return res.status(401).json({ error: "Access token is required" });
  }

  jwt.verify(token, SECRET_KEY, (err, user) => {
    if (err) {
      console.error("Token verification failed:", err.message); // <-- Tambahkan ini
      return res.status(403).json({ error: "Invalid access token" });
    }

    console.log("Token successfully verified. Payload:", user); // <-- Tambahkan ini

    req.user = user;
    next();
  });
}

module.exports = verifyToken;
