const mongoose = require("mongoose");
const User = require("../models/user");
const bcrypt = require("bcrypt");

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

exports.updateUsername = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { username } = req.body;

    if (!username || typeof username !== "string" || username.trim() === "") {
      return res.status(400).json({ error: "Invalid username" });
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { username: username.trim() },
      { new: true, runValidators: true }
    ).select("username email");

    if (!updatedUser) {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(200).json({
      success: true,
      message: "Username updated successfully",
      data: updatedUser,
    });
  } catch (err) {
    console.error("Error updating username:", err);
    res.status(500).json({ error: "Server error" });
  }
};

exports.updatePassword = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { password } = req.body;

    // Validasi hanya untuk password baru
    if (!password) {
      return res.status(400).json({ error: "New password is required" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Manual hashing
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    user.password = hashedPassword; // Model Mongoose akan melakukan hashing saat .save()
    await user.save();

    res.status(200).json({
      success: true,
      message: "Password updated successfully",
    });
  } catch (err) {
    console.error("Error updating password:", err);
    res.status(500).json({ error: "Server error" });
  }
};

exports.getFavoriteMovies = async (req, res) => {
  try {
    const targetUserId = req.params.id;
    const loggedInUserId = req.user.userId;

    // Cek validitas ObjectId
    if (!mongoose.Types.ObjectId.isValid(targetUserId)) {
      return res.status(400).json({ error: "Invalid user ID" });
    }

    // Hanya boleh akses favorit diri sendiri
    if (String(loggedInUserId) !== String(targetUserId)) {
      return res
        .status(403)
        .json({ error: "Forbidden. You can only view your own favorites." });
    }

    // Ambil user terlebih dulu
    const user = await User.findById(targetUserId);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Debug isi favorit sebelum populate
    console.log("Favorite Movie IDs:", user.favoriteMovies);

    // Populate movie details
    const populatedUser = await user.populate({
      path: "favoriteMovies",
      populate: {
        path: "comments.userId",
        model: "User",
      },
    });

    // Jika kosong
    if (
      !populatedUser.favoriteMovies ||
      populatedUser.favoriteMovies.length === 0
    ) {
      return res.status(200).json({
        success: true,
        message: "No favorite movies found.",
        data: [],
      });
    }

    res.status(200).json({
      success: true,
      message: "Favorite movies fetched successfully",
      data: populatedUser.favoriteMovies,
    });
  } catch (err) {
    console.error("Error fetching favorite movies:", err);
    res.status(500).json({ error: "Server error" });
  }
};

exports.addFavoriteMovie = async (req, res) => {
  try {
    const targetUserId = req.params.id;
    const loggedInUserId = req.user.userId;
    if (String(loggedInUserId) !== String(targetUserId)) {
      return res
        .status(403)
        .json({ error: "You can only modify your own favorites" });
    }

    const { movieId } = req.body;
    if (!movieId || !mongoose.Types.ObjectId.isValid(movieId)) {
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
    const { id: targetUserId, movieId } = req.params;
    const loggedInUserId = req.user.userId;

    if (String(loggedInUserId) !== String(targetUserId)) {
      return res
        .status(403)
        .json({ error: "You can only modify your own favorites" });
    }
    if (!movieId || !mongoose.Types.ObjectId.isValid(movieId)) {
      return res.status(400).json({ error: "Invalid movie ID" });
    }
    const user = await User.findById(targetUserId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const movieExists = user.favoriteMovies.some(
      (favMovieId) => String(favMovieId) === String(movieId)
    );
    if (!movieExists) {
      return res.status(404).json({ error: "Movie not found in favorites" });
    }
    user.favoriteMovies.pull(movieId);
    await user.save();

    const updatedUser = await User.findById(targetUserId).populate(
      "favoriteMovies"
    );
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
