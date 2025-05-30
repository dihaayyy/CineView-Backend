const express = require("express");
const router = express.Router();
const movieController = require("../controllers/movie.controller"); // Adjust the path as necessary

router.post("/", movieController.addMovie);
router.get("/", movieController.getAllMovies);
router.get("/:id", movieController.getMoviebyId);
router.put("/:id", movieController.updateMoviebyId);
router.delete("/:id", movieController.deleteMoviebyId);
router.post("/:id/rate", movieController.rateMovie);
router.post("/:id/comment", movieController.commentOnMovie);

module.exports = router;
