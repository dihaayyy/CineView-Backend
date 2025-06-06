const express = require("express");
const router = express.Router();
const movieController = require("../controllers/movie.controller"); // Adjust the path as necessary

router.post("/", movieController.addMovie);
router.get("/", movieController.getAllMovies);
router.get("/:id", movieController.getMoviebyId);
router.put("/:id", movieController.updateMoviebyId);
router.put("/:id/poster", movieController.updatePosterUrl);
router.delete("/:id", movieController.deleteMoviebyId);
router.get("/:id/ratings", movieController.getRatingsByMovieId);
router.post("/movies/:id/rating", movieController.addMovieRating);
router.put("/movies/:id/rating", movieController.updateMovieRating);
router.delete("/movies/:id/rating", movieController.deleteMovieRating);
router.post("/:id/comment", movieController.commentOnMovie);

module.exports = router;
