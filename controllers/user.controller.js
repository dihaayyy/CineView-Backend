const mongoose = require("mongoose");
const User = require("../models/user");

// GET All /users
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}, "username email");
    if (!users || users.length === 0) {
      return res.status(404).json({ error: "No users found" });
    }
    res.status(200).json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ error: "Server error" });
  }
};

/// GET /users by ID
exports.getUserById = async (req, res) => {
  const userId = req.params.id;
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(400).json({ error: "Invalid user ID" });
  }

  try {
    const user = await User.findById(userId).select("username email");
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.status(200).json(user);
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({ error: "Server error" });
  }
};

// GET Logged-in User Profile
exports.getLoggedInUserProfile = async (req, res) => {
  try {
    const userId = req.user.userId;
    const user = await User.findById(userId).select(
      "username email favoriteMovies"
    );

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.status(200).json(user);
  } catch (err) {
    console.error("Error fetching logged-in user profile:", err);
    res.status(500).json({ error: "Server error" });
  }
};

// Adding Favorite Movie to User
exports.addFavoriteMovie = async (req, res) => {
  try {
    const userId = req.user.userId;
    const movieId = req.body.movieId;
    const user = await User.findById(userId);

    
    if (!movieId) {
      return res.status(400).json({ error: "Movie ID is required" });
    }
    if (!mongoose.Types.ObjectId.isValid(movieId)) {
      return res.status(400).json({ error: "Invalid movie ID" });
    }
    const updateUser = await User.findByIdAndUpdate(
      userId,
      { $addToSet: { favoriteMovies: movieId } },
      { new: true }
    );
    if (!updateUser) {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(200).json({
      success: true,
      message: "Movie added to favorites successfully",
      favoriteMovies: updateUser.favoriteMovies,
    });

  } catch (err) {
    console.error("Error adding favorite movie:", err);
    res.status(500).json({ error: "Server error" });
  }
}

exports.getFavoriteMovies = async (req, res) => {
  try {
    const userId = req.user.userId;
    const user = await userFindById(userId).populate({
      path: "favoriteMovies",
      model: "Movie",
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
  } catch (err) {
    console.error("Error fetching favorite movies:", err);
    res.status(500).json({ error: "Server error" });
  }
}
