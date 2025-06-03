const express = require("express");
const router = express.Router();
const userController = require("../controllers/user.controller"); // Adjust the path as necessary
const verifyToken = require("../middlewares/auth.middleware"); // Adjust the path as necessary

router.get("/all", userController.getUserById); // Get all users
router.get("/profile", verifyToken, userController.getLoggedInUserProfile); // Get logged-in user profile
router.get("/:id", userController.getUserById); // Get user by ID

module.exports = router;
