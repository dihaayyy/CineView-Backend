require("dotenv").config();

module.exports = {
  PORT: process.env.PORT || 3000,
  mongoURI: process.env.MONGO_URI || "mongodb://localhost:27017/cineview",
  JWT_SECRET: process.env.JWT_SECRET || "superidol",
};
