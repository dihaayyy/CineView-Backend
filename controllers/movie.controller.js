const mongoose = require("mongoose");
const Movie = require("../models/movie");

// POST /movies - Add a new movie
exports.addMovie = async (req, res) => {
  const { title, description, genre, releaseYear, category } = req.body;
  if (!title || !description || !genre || !releaseYear || !category) {
    return res.status(400).json({ error: "All fields are required" });
  }
  try {
    const movie = new Movie({
      title,
      description,
      genre,
      releaseYear,
      category,
    });

    await movie.save(); // ✅ simpan ke MongoDB
    res.status(201).json({ message: "Movie added successfully", movie });
  } catch (err) {
    console.error("Add movie error:", err);
    res.status(500).json({ error: "Server error" });
  }
};

// GET /movies - Get all movies
exports.getAllMovies = async (req, res) => {
  try {
    const searchQuery = req.query.search || "";
    const regex = new RegExp(searchQuery, "i"); // Case-insensitive regex
    const movies = await Movie.find({
      title: { $regex: regex },
    });
    res.status(200).json(movies);
  } catch (err) {
    console.error("Get all movies error:", err);
    res.status(500).json({ error: "Failed to fetch movies." });
  }
};

// GET /movies/:id - Get a movie by ID
exports.getMoviebyId = async (req, res) => {
  const movieId = req.params.id;

  if (!mongoose.Types.ObjectId.isValid(movieId)) {
    return res.status(400).json({ error: "Invalid movie ID" });
  }

  try {
    const movie = await Movie.findById(movieId);
    if (!movie) {
      return res.status(404).json({ error: "Movie not found" });
    }
    res.json(movie);
  } catch (err) {
    console.error("Get movie by ID error:", err);
    res.status(500).json({ error: "Server error" });
  }
};

// PUT /movies/:id - Update a movie by ID
exports.updateMoviebyId = async (req, res) => {
  const movieId = req.params.id;

  if (!mongoose.Types.ObjectId.isValid(movieId)) {
    return res.status(400).json({ error: "Invalid movie ID" });
  }

  try {
    const updatedMovie = await Movie.findByIdAndUpdate(movieId, req.body, {
      new: true, // Mengembalikan data sesudah update
      runValidators: true, // Menjalankan validasi pada schema
    });

    if (!updatedMovie) {
      return res.status(404).json({ error: "Movie not found" });
    }
    res.json({ message: "Movie updated successfully", movie: updatedMovie });
  } catch (err) {
    console.error("Update movie error:", err);
    res.status(500).json({ error: "Server error" });
  }
};

// DELETE /movies/:id - Delete a movie by ID
exports.deleteMoviebyId = async (req, res) => {
  const movieId = req.params.id;

  if (!mongoose.Types.ObjectId.isValid(movieId)) {
    return res.status(400).json({ error: "Invalid movie ID" });
  }

  try {
    const deletedMovie = await Movie.findByIdAndDelete(movieId);
    if (!deletedMovie) {
      return res.status(404).json({ error: "Movie not found" });
    }
    res.json({ message: "Movie deleted successfully", movie: deletedMovie });
  } catch (err) {
    console.error("Delete movie error:", err);
    res.status(500).json({ error: "Server error" });
  }
};

exports.addMovieRatings = async (req, res) => {
  const movieId = req.params.id;
  const userId = req.user?.id || req.body.userId; // Ambil userId dari token atau body
  const { rating } = req.body;

  if (
    !mongoose.Types.ObjectId.isValid(movieId) ||
    !mongoose.Types.ObjectId.isValid(userId)
  ) {
    return res.status(400).json({ error: "Invalid movie or user ID" });
  }
  if (typeof rating !== "number" || rating < 1 || rating > 5) {
    return res
      .status(400)
      .json({ error: "Rating must be a number between 1 and 5" });
  }

  try {
    const movie = await Movie.findById(movieId);
    if (!movie) {
      return res.status(404).json({ error: "Movie not found" });
    }
    const existingRatingIndex = movie.ratings.findIndex(
      (r) => r.userId.toString() === userId
    );

    if (existingRatingIndex !== -1) {
      // Update rating
      movie.ratings[existingRatingIndex].rating = rating;
    } else {
      // tambah rating baru
      movie.ratings.push({ userId, rating });
    }

    const total = movie.ratings.reduce((sum, r) => sum + r.rating, 0);
    movie.averageRating = total / movie.ratings.length;

    await movie.save();
    res.status(200).json({
      message: "Rating added/updated successfully",
      movie,
    });
  } catch (err) {
    console.error("Add movie rating error:", err);
    res.status(500).json({ error: "Server error" });
  }
};

exports.getRatingsByMovieId = async (req, res) => {
  const movieId = req.params.id;

  if (!mongoose.Types.ObjectId.isValid(movieId)) {
    return res.status(400).json({ error: "Invalid movie ID" });
  }

  try {
    const movie = await Movie.findById(movieId).populate(
      "ratings.userId",
      "name email"
    );

    if (!movie) {
      return res.status(404).json({ error: "Movie not found" });
    }

    res.status(200).json({
      movieId: movie._id,
      title: movie.title,
      averageRating: movie.averageRating,
      totalRatings: movie.ratings.length,
      ratings: movie.ratings.map((r) => ({
        user: r.userId, // ini akan otomatis resolve jadi nama & email jika pakai populate
        rating: r.rating,
      })),
    });
  } catch (err) {
    console.error("Get ratings by movie ID error:", err);
    res.status(500).json({ error: "Server error" });
  }
};


exports.commentOnMovie = (req, res) => {
  const { comment } = req.body;
  const movieId = parseInt(req.params.id, 10);
  const movie = movies.find((m) => m.id === movieId);
  if (!movie) {
    return res.status(404).json({ error: "Movie not found" });
  }
  if (!comment || typeof comment !== "string") {
    return res
      .status(400)
      .json({ error: "Comment is required and must be a string" });
  }
  if (!movie.comments) {
    movie.comments = [];
  }
  movie.comments.push(comment);
  res.json({ message: "Comment added successfully", movie });
};

exports.updatePosterUrl = async (req, res) => {
  try {
    const movieId = req.params.id;
    const { posterUrl } = req.body;

    const movie = await Movie.findByIdAndUpdate(
      movieId,
      { posterUrl },
      { new: true }
    );

    res.status(200).json({
      message: "Poster URL updated successfully",
      movie,
    });
  } catch (err) {
    res.status(500).json({
      error: "Failed to update poster URL",
      details: err.message,
    });
  }
};
