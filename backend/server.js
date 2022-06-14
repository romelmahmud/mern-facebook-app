const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const connectDB = require("./config/db");
const colors = require("colors");
const cors = require("cors");
const userRoutes = require("./routes/user");
const dotenv = require("dotenv").config();

connectDB();

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use("/api", userRoutes);

const PORT = process.env.PORT || 8000;

app.listen(PORT, () => {
  console.log("Server is running");
});
