const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");
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
  const userId = req.user.userId; // Ambil userId dari token atau body
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

    const existingRating = movie.ratings.find(
      (r) => r.userId.toString() === userId
    );
    if (existingRating) {
      return res.status(400).json({
        error: "User has already rated this movie",
        existingRating: existingRating.rating,
      });
    }

    movie.ratings.push({ userId, rating });

    movie.averageRating =
      movie.ratings.reduce((sum, r) => sum + r.rating, 0) /
      movie.ratings.length;

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

exports.updateMovieRating = async (req, res) => {
  const movieId = req.params.id;
  const userId = req.user.userId; // Ambil userId dari token
  const { rating } = req.body;

  if (
    !mongoose.Types.ObjectId.isValid(movieId) ||
    !mongoose.Types.ObjectId.isValid(userId)
  ) {
    return res.status(400).json({ error: "Invalid movie ID or user ID" });
  }

  if (typeof rating !== "number" || rating < 1 || rating > 5) {
    return res.status(400).json({ error: "Rating must be between 1 and 5" });
  }

  try {
    const movie = await Movie.findById(movieId);
    if (!movie) return res.status(404).json({ error: "Movie not found" });

    const existing = movie.ratings.find((r) => r.userId.toString() === userId);
    if (!existing) {
      return res.status(404).json({ error: "User rating not found" });
    }

    existing.rating = rating;
    existing.createdAt = new Date(); // Update timestamp

    const sum = movie.ratings.reduce((acc, r) => acc + r.rating, 0);
    movie.averageRating = sum / movie.ratings.length;

    await movie.save();
    res.json({ message: "Rating updated successfully", movie });
  } catch (err) {
    console.error("Update rating error:", err);
    res.status(500).json({ error: "Server error" });
  }
};

exports.deleteMovieRating = async (req, res) => {
  const movieId = req.params.id;
  const userId = req.user.userId; // Ambil userId dari token

  if (
    !mongoose.Types.ObjectId.isValid(movieId) ||
    !mongoose.Types.ObjectId.isValid(userId)
  ) {
    return res.status(400).json({ error: "Invalid movie ID or user ID" });
  }

  try {
    const movie = await Movie.findById(movieId);
    if (!movie) return res.status(404).json({ error: "Movie not found" });

    const originalLength = movie.ratings.length;
    movie.ratings = movie.ratings.filter((r) => r.userId.toString() !== userId);

    if (movie.ratings.length === originalLength) {
      return res.status(404).json({ error: "User rating not found" });
    }

    // Hitung ulang averageRating
    const total = movie.ratings.reduce((sum, r) => sum + r.rating, 0);
    movie.averageRating =
      movie.ratings.length > 0 ? total / movie.ratings.length : 0;

    await movie.save();
    res.json({ message: "Rating deleted successfully", movie });
  } catch (err) {
    console.error("Delete rating error:", err);
    res.status(500).json({ error: "Server error" });
  }
};

exports.commentOnMovie = async (req, res) => {
  try {
    const { comment } = req.body;
    const movieId = req.params.id;
    const userId = req.user.userId;
    const userName = req.user.name || req.user.username || "Unknown";

    if (!comment || typeof comment !== "string") {
      return res.status(400).json({ error: "Comment is required" });
    }

    // Cari movie berdasarkan ID
    const movie = await Movie.findById(movieId);
    if (!movie) {
      return res.status(404).json({ error: "Movie not found" });
    }

    // Buat komentar baru dengan id unik
    const newComment = {
      id: uuidv4(),
      userId,
      userName,
      text: comment,
      createdAt: new Date(),
    };

    // Jika komentar belum ada, inisialisasi array
    if (!Array.isArray(movie.comments)) {
      movie.comments = [];
    }

    movie.comments.push(newComment);

    // Simpan perubahan ke DB
    await movie.save();

    return res.status(200).json({
      message: "Comment added successfully",
      comment: newComment,
      movieId: movie._id,
    });
  } catch (error) {
    console.error("Error adding comment:", error);
    return res.status(500).json({ error: "Server error" });
  }
};

exports.getCommentsByMovieId = (req, res) => {
  const movieId = req.params.id;

  // Validasi ID film
  if (!mongoose.Types.ObjectId.isValid(movieId)) {
    return res.status(400).json({ error: "Invalid movie ID" });
  }

  // Temukan film berdasarkan ID
  Movie.findById(movieId)
    .select("comments") // Hanya ambil field comments
    .then((movie) => {
      if (!movie) {
        return res.status(404).json({ error: "Movie not found" });
      }
      res.status(200).json({
        movieId: movie._id,
        comments: movie.comments || [],
      });
    })
    .catch((err) => {
      console.error("Get comments error:", err);
      res.status(500).json({ error: "Server error" });
    });
};

exports.updateComment = async (req, res) => {
  try {
    const { movieId, commentId } = req.params;
    const { text } = req.body;
    const userId = req.user.userId;

    const movie = await Movie.findById(movieId);
    if (!movie) return res.status(404).json({ error: "Movie not found" });

    const comment = movie.comments.find((c) => c.id === commentId);
    if (!comment) return res.status(404).json({ error: "Comment not found" });

    if (comment.userId !== userId) {
      return res
        .status(403)
        .json({ error: "You can only edit your own comments" });
    }

    comment.text = text;
    comment.updatedAt = new Date();

    await movie.save();

    res.status(200).json({
      message: "Comment updated successfully",
      comment,
      movieId: movie._id,
    });
  } catch (error) {
    console.error("Error updating comment:", error);
    res.status(500).json({ error: "Server error" });
  }
};

exports.deleteComment = async (req, res) => {
  try {
    const { movieId, commentId } = req.params;
    const userId = req.user.userId; // userId dari token

    // Cari movie berdasarkan ID
    const movie = await Movie.findById(movieId);
    if (!movie) {
      return res.status(404).json({ error: "Movie not found" });
    }

    // Cari index komentar yang mau dihapus
    const commentIndex = movie.comments.findIndex((c) => c.id === commentId);
    if (commentIndex === -1) {
      return res.status(404).json({ error: "Comment not found" });
    }

    // Cek apakah komentar milik user yang login
    if (movie.comments[commentIndex].userId !== userId) {
      return res
        .status(403)
        .json({ error: "You can only delete your own comments" });
    }

    // Hapus komentar dari array
    movie.comments.splice(commentIndex, 1);

    // Simpan perubahan ke database
    await movie.save();

    return res.status(200).json({
      message: "Comment deleted successfully",
      movieId: movie._id,
    });
  } catch (error) {
    console.error("Error deleting comment:", error);
    return res.status(500).json({ error: "Server error" });
  }
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
