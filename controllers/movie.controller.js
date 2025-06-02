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
    const movies = await Movie.find();
    if (movies.length === 0) {
      return res.status(404).json({ error: "No movies found" });
    }
    res.json(movies);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
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

exports.rateMovie = (req, res) => {
  const { rating } = req.body;
  const movieId = parseInt(req.params.id, 10);
  const movie = movies.find((m) => m.id === movieId);
  if (!movie) {
    return res.status(404).json({ error: "Movie not found" });
  }
  if (typeof rating !== "number" || rating < 1 || rating > 5) {
    return res
      .status(400)
      .json({ error: "Rating must be a number between 1 and 5" });
  }

  // Tambah rating ke array ratings
  movie.ratings.push(rating);

  // Hitung rata-rata rating yang ada
  const sum = movie.ratings.reduce((acc, cur) => acc + cur, 0);
  movie.averageRating = sum / movie.ratings.length;

  res.json({ message: "Rating updated successfully", movie });
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
