// const express = require("express");
// const passport = require("passport");
// const axios = require("axios");
// const dayjs = require("dayjs");
// const { dynamoDB, TABLE_NAME, GetCommand } = require("../config/db");

// const router = express.Router();

// router.get("/fitbit", passport.authenticate("fitbit"));

// router.get(
//     "/fitness/fitbit_redirect",
//     passport.authenticate("fitbit", { failureRedirect: "/" }),
//     (req, res) => {
//         // res.json({ message: "Successfully authenticated with Fitbit" });
//         res.redirect("/auth/profile");
//     }
// );


// router.get("/profile", async (req, res) => {
//     if (!req.isAuthenticated()) {
//         return res.status(401).json({ error: "Unauthorized" });
//     }

//     const currentDate = dayjs().format("YYYY-MM-DD"); // Get today's date in YYYY-MM-DD format

//     try {
//         const response = await axios.get(
//             `https://api.fitbit.com/1/user/-/activities/date/${currentDate}.json`,
//             {
//                 headers: { Authorization: `Bearer ${req.user.accessToken}` },
//             }
//         );

//         res.json({
//             user: req.user,
//             fitnessData: response.data.summary,
//         });
//     } catch (error) {
//         console.error("Error fetching fitness data:", error.response?.data || error.message);
//         res.status(500).json({
//             error: "Failed to fetch fitness data",
//             details: error.response?.data || error.message
//         });
//     }
// });


// router.get("/logout", (req, res) => {
//     req.logout((err) => {
//         if (err) return next(err);
//         res.redirect("/");
//     });
// });

// module.exports = router;
const express = require("express");
const passport = require("passport");
const { dynamoDB, TABLE_NAME } = require("../config/db");
const { QueryCommand } = require("@aws-sdk/lib-dynamodb");

const router = express.Router();

router.get("/fitbit", passport.authenticate("fitbit"));

router.get(
    "/fitness/fitbit_redirect",
    passport.authenticate("fitbit", { failureRedirect: "/" }),
    (req, res) => {
        res.redirect("/auth/profile");
    }
);

// Function to Fetch Latest Fitness Data
const fetchLatestFitnessData = async (userId) => {
    try {
        const result = await dynamoDB.send(new QueryCommand({
            TableName: TABLE_NAME,
            KeyConditionExpression: "userId = :userId",
            ExpressionAttributeValues: {
                ":userId": userId,
            },
            ScanIndexForward: false, // Get latest entry first
            Limit: 1, // Only fetch the latest record
        }));

        return result.Items.length > 0 ? result.Items[0] : null;
    } catch (error) {
        console.error("❌ Error fetching latest fitness data:", error);
        throw error;
    }
};

// Function to Poll for Updated Fitness Data
const fetchUpdatedFitnessData = async (userId, maxRetries = 5, delayMs = 2000) => {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            const latestData = await fetchLatestFitnessData(userId);

            if (latestData) {
                console.log(`✅ Data found after ${attempt} attempt(s)`);
                return latestData;
            }

            console.log(`⏳ Attempt ${attempt}: Data not available yet...`);
            await new Promise(resolve => setTimeout(resolve, delayMs)); // Wait before retrying
        } catch (error) {
            console.error("❌ Error fetching fitness data:", error);
            throw error;
        }
    }

    throw new Error("🚨 Fitness data update timed out.");
};

// Profile Route
router.get("/profile", async (req, res) => {
    if (!req.isAuthenticated()) {
        return res.status(401).json({ error: "Unauthorized" });
    }

    const userId = req.user.userId;

    try {
        // Fetch latest fitness data based on userId and latest date
        const fitnessData = await fetchLatestFitnessData(userId);

        if (fitnessData) {
            console.log("✅ Latest fitness data found!");
            return res.json({ user: req.user, fitnessData });
        }

        // If no data found, poll for new updates
        console.log("🆕 No existing data found. Polling for first-time data...");
        const updatedData = await fetchUpdatedFitnessData(userId);
        res.json({ user: req.user, fitnessData: updatedData });
    } catch (error) {
        res.status(500).json({
            error: "Failed to fetch fitness data",
            details: error.message
        });
    }
});

module.exports = router;

