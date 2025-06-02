const express = require("express");
const router = express.Router();
const userController = require("../controllers/user.controller"); // Adjust the path as necessary

router.get("/:id", userController.getUserById); // Get user by ID

module.exports = router;
