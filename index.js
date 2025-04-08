const express = require("express");
const session = require("express-session");
const passport = require("passport");
const cors = require("cors");
require("dotenv").config();
require("./config/passportFitbit");

const fitnessRoutes = require("./routes/fitnessRoutes");
const authRoutes = require("./routes/authRoutes");

const app = express();
const PORT = 3001;

app.use(cors());

app.use(
    session({
        secret: process.env.SESSION_SECRET,
        resave: false,
        saveUninitialized: true,
    })
);

app.use(passport.initialize());
app.use(passport.session());

app.use(express.json());
app.use("/fitness", fitnessRoutes);
app.use("/auth", authRoutes);

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});