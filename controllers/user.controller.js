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
    const loggedInUserId = req.user.userId;
    const targetUserId = req.params.userId;

    if (loggedInUserId !== targetUserId) {
      return res
        .status(403)
        .json({ error: "You can only modify your own favorites" });
    }

    const user = await User.findById(targetUserId).populate({
      path: "favoriteMovies",
      model: "Movie",
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // If Success
    res.status(200).json({
      success: true,
      message: "Favorite movies fetched successfully",
      favoriteMovies: user.favoriteMovies,
    });
  } catch (err) {
    console.error("Error adding favorite movie:", err);
    res.status(500).json({ error: "Server error" });
  }
};

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
};

exports.addFavoriteMovie = async (req, res) => {
  try {
    const { userId: targetUserId } = req.params;
    const { userId: loggedInUserId } = req.user;
    if (loggedInUserId !== targetUserId) {
      return res
        .status(403)
        .json({ error: "You can only modify your own favorites" });
    }

    const { movieId } = req.body;
    if (!movie || !mongoose.Types.ObjectId.isValid(movieId)) {
      return res.status(400).json({ error: "Invalid movie ID" });
    }

    const updatedUser = await User.findByIdAndUpdate(
      targetUserId,
      { $addToSet: { favoriteMovies: movieId } },
      { new: true, runValidators: true }
    ).populate("favoriteMovies");

    if (!updatedUser) {
      return res.status(404).json({ error: "User not found" });
    }

    // if Success
    res.status(200).json({
      success: true,
      message: "Favorite movie added successfully",
      data: updatedUser.favoriteMovies,
    });
  } catch (err) {
    console.error("Error adding favorite movie:", err);
    res.status(500).json({ error: "Server error" });
  }
};

exports.deleteFavoriteMovies = async (req, res) => {
  try {
    const { userId: targetUserId, movieId } = req.params;
    const { userId: loggedInUserId } = req.user;

    if (loggedInUserId !== targetUserId) {
      return res
        .status(403)
        .json({ error: "You can only modify your own favorites" });
    }
    if (!movieId || !mongoose.Types.ObjectId.isValid(movieId)) {
      return res.status(400).json({ error: "Invalid movie ID" });
    }

    const updatedUser = await User.findByIdAndUpdate(
      targetUserId,
      { $pull: { favoriteMovies: movieId } },
      { new: true, runValidators: true }
    ).populate("favoriteMovies");

    if (!updatedUser) {
      return res.status(404).json({ error: "User not found" });
    }

    // if Success
    res.status(200).json({
      success: true,
      message: "Favorite movie removed successfully",
      data: updatedUser.favoriteMovies,
    });
  } catch (err) {
    console.error("Error deleting favorite movie:", err);
    res.status(500).json({ error: "Server error" });
  }
};
