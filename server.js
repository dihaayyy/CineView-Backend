const express = require("express");
const cors = require("cors");
require("dotenv").config();

const connectDB = require("./db/db");

const authRoutes = require("./routes/auth.routes");
const movieRoutes = require("./routes/movie.routes");
const userRoutes = require("./routes/user.routes");

const app = express();
const port = process.env.port || 3000;

connectDB();

app.use(express.json());
app.use(cors());

app.use("/api/auth", authRoutes);
app.use("/api/movies", movieRoutes);
app.use("/api/users", userRoutes);

app.listen(port, "0.0.0.0", () => {
  console.log(`Server is running on http://localhost:${port}`);
});
