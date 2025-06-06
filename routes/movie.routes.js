const express = require("express");
const router = express.Router();
const movieController = require("../controllers/movie.controller");
const verifyToken = require("../middlewares/auth.middleware");

router.post("/", movieController.addMovie);
router.get("/", movieController.getAllMovies);
router.get("/:id", movieController.getMoviebyId);
router.put("/:id", movieController.updateMoviebyId);
router.put("/:id/poster", movieController.updatePosterUrl);
router.delete("/:id", movieController.deleteMoviebyId);
router.get("/:id/ratings", movieController.getRatingsByMovieId);
router.post("/movies/:id/rating", verifyToken, movieController.addMovieRatings);
router.put(
  "/movies/:id/rating",
  verifyToken,
  movieController.updateMovieRating
);
router.delete(
  "/movies/:id/rating",
  verifyToken,
  movieController.deleteMovieRating
);
router.post("/:id/comment", movieController.commentOnMovie);

module.exports = router;
