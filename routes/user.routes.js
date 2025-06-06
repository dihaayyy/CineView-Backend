const express = require("express");
const router = express.Router();
const userController = require("../controllers/user.controller"); // Adjust the path as necessary
const verifyToken = require("../middlewares/auth.middleware"); // Adjust the path as necessary

router.get("/all", userController.getUserById); // Get all users
router.get("/profile", verifyToken, userController.getLoggedInUserProfile); // Get logged-in user profile
router.get("/:id", userController.getUserById); // Get user by ID
router.get("/:id/favorites", verifyToken, userController.getUserFavorites); // Get user's favorite movies
router.post("/:id/favorites", verifyToken, userController.addFavoriteMovie); // Add favorite movie to user
router.delete("/id/favorites/:movieId", verifyToken, userController.deleteFavoriteMovie); // Remove favorite movie from user

module.exports = router;
