const express = require("express");
const passport = require("passport");
const axios = require("axios");
const dayjs = require("dayjs");

const router = express.Router();

router.get("/fitbit", passport.authenticate("fitbit"));

router.get(
    "/fitness/fitbit_redirect",
    passport.authenticate("fitbit", { failureRedirect: "/" }),
    (req, res) => {
        // res.json({ message: "Successfully authenticated with Fitbit" });
        res.redirect("/auth/profile");
    }
);


router.get("/profile", async (req, res) => {
    if (!req.isAuthenticated()) {
        return res.status(401).json({ error: "Unauthorized" });
    }

    const currentDate = dayjs().format("YYYY-MM-DD"); // Get today's date in YYYY-MM-DD format

    try {
        const response = await axios.get(
            `https://api.fitbit.com/1/user/-/activities/date/${currentDate}.json`,
            {
                headers: { Authorization: `Bearer ${req.user.accessToken}` },
            }
        );

        res.json({
            user: req.user,
            fitnessData: response.data.summary,
        });
    } catch (error) {
        console.error("Error fetching fitness data:", error.response?.data || error.message);
        res.status(500).json({
            error: "Failed to fetch fitness data",
            details: error.response?.data || error.message
        });
    }
});


router.get("/logout", (req, res) => {
    req.logout((err) => {
        if (err) return next(err);
        res.redirect("/");
    });
});

module.exports = router;
