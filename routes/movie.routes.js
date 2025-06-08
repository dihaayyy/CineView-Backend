const express = require("express");
const router = express.Router();
const movieController = require("../controllers/movie.controller");
const verifyToken = require("../middlewares/auth.middleware");

router.post("/", movieController.addMovie);
router.get("/", movieController.getAllMovies);
router.get("/top-rated", movieController.getTopRatedMovies);
router.get("/:id", movieController.getMoviebyId);
router.put("/:id", movieController.updateMoviebyId);
router.put("/:id/poster", movieController.updatePosterUrl);
router.delete("/:id", movieController.deleteMoviebyId);
router.get("/:id/ratings", movieController.getRatingsByMovieId);
router.post("/:id/ratings", verifyToken, movieController.addMovieRatings);
router.put("/:id/ratings", verifyToken, movieController.updateMovieRating);
router.delete("/:id/ratings", verifyToken, movieController.deleteMovieRating);
router.post("/:id/comments", verifyToken, movieController.commentOnMovie);
router.get("/:id/comments", movieController.getCommentsByMovieId); // public
router.put(
  "/:id/comments/:commentId",
  verifyToken,
  movieController.updateComment
);
router.delete(
  "/:id/comments/:commentId",
  verifyToken,
  movieController.deleteComment
);

module.exports = router;
