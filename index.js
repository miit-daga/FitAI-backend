const express = require("express");
const session = require("express-session");
const passport = require("passport");
require("dotenv").config();
require("./config/passportFitbit");

const fitnessRoutes = require("./routes/fitnessRoutes");
const authRoutes = require("./routes/authRoutes");

const app = express();
const PORT = 3001;

// Session Middleware
app.use(
    session({
        secret: process.env.SESSION_SECRET,
        resave: false,
        saveUninitialized: true,
    })
);

// Passport Middleware
app.use(passport.initialize());
app.use(passport.session());

app.use(express.json());
app.use("/fitness", fitnessRoutes);
app.use("/auth", authRoutes);

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
