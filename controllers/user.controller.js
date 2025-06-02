const mongoose = require("mongoose");
const User = require("../models/user");

/// GET /users by ID
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("username email");
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.status(200).json(user);
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({ error: "Server error" });
  }
};

