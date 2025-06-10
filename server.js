require("dotenv").config();
const express = require("express");
const cors = require("cors");
const passport = require("passport");
const app = express();

const authRoutes = require("./src/routes/auth.routes");

app.use(cors());
app.use(express.json());
app.use(passport.initialize());

app.use("/api/auth", authRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
