const express = require("express");
const router = express.Router();
const userController = require("../controllers/user.controller"); // Adjust the path as necessary
const verifyToken = require("../middlewares/auth.middleware"); // Adjust the path as necessary

router.get("/profile", verifyToken, userController.getLoggedInUserProfile); // Get logged-in user profile
router.get("/all", userController.getAllUsers); // Get all users
router.get("/:id", verifyToken, userController.getUserById); // Get user by ID
router.get("/:id/favorites", verifyToken, userController.getFavoriteMovies); // Get user's favorite movies
router.post("/:id/favorites", verifyToken, userController.addFavoriteMovie); // Add favorite movie to user
router.delete(
  "/:userId/favorites/:id",
  verifyToken,
  userController.deleteFavoriteMovies
); // Remove favorite movie from user

module.exports = router;
