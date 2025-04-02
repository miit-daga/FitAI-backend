const express = require("express");
const passport = require("passport");
const { GetCommand } = require("@aws-sdk/lib-dynamodb");
const { dynamoDB, TABLE_NAME,TABLE_NAME_USER} = require("../config/db");
const { QueryCommand } = require("@aws-sdk/lib-dynamodb");

const { BedrockChat } = require("@langchain/community/chat_models/bedrock");
const dotenv = require("dotenv");
const { BufferMemory } = require("langchain/memory");
const { ConversationChain } = require("langchain/chains");

dotenv.config();
const apiKey = process.env.BEDROCK_AWS_ACCESS_KEY_ID;
const secretKey = process.env.BEDROCK_AWS_SECRET_ACCESS_KEY;
const region = process.env.BEDROCK_AWS_REGION;
const router = express.Router();

router.get("/fitbit", passport.authenticate("fitbit"));

router.get(
    "/fitness/fitbit_redirect",
    passport.authenticate("fitbit", { failureRedirect: "/" }),
    (req, res) => {
        res.send("Fitbit Authentication successful.");
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
        console.error("Error fetching latest fitness data:", error);
        throw error;
    }
};

// Function to Poll for Updated Fitness Data
const fetchUpdatedFitnessData = async (userId, maxRetries = 5, delayMs = 2000) => {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            const latestData = await fetchLatestFitnessData(userId);

            if (latestData) {
                console.log(`Data found after ${attempt} attempt(s)`);
                return latestData;
            }

            console.log(`Attempt ${attempt}: Data not available yet...`);
            await new Promise(resolve => setTimeout(resolve, delayMs)); // Wait before retrying
        } catch (error) {
            console.error("Error fetching fitness data:", error);
            throw error;
        }
    }

    throw new Error("Fitness data update timed out.");
};

router.get("/profile/:userId", async (req, res) => {
    const userId = req.params.userId;

    try {
        const userResult = await dynamoDB.send(new GetCommand({
            TableName: TABLE_NAME_USER,
            Key: { userId }
        }));

        if (!userResult.Item) {
            return res.status(404).json({ error: "User not found" });
        }

        const user = userResult.Item;

        const fitnessData = await fetchLatestFitnessData(userId);

        if (fitnessData) {
            console.log("Latest fitness data found!");
            return res.json({ user, fitnessData });
        }
        console.log("No existing data found. Polling for first-time data...");
        const updatedData = await fetchUpdatedFitnessData(userId);
        res.json({ user, fitnessData: updatedData });
    } catch (error) {
        res.status(500).json({
            error: "Failed to fetch fitness data",
            details: error.message
        });
    }
});

const llm = new BedrockChat({
    model: "meta.llama3-8b-instruct-v1:0",
    region: region,
    credentials: {
        accessKeyId: apiKey,
        secretAccessKey: secretKey,
    },
});
const memory = new BufferMemory();

const chain = new ConversationChain({ llm: llm, memory: memory });
router.post("/model", async (req, res) => {
    const { userId, query } = req.body;
    if (!userId) {
        return res.status(400).json({ error: "User ID is required" });
    }
    try {
        const updatedData = await fetchUpdatedFitnessData(userId);
        const { heart_rate, ...dataWithoutHeartRate } = updatedData;
        const response = await chain.call({
            input: {
                query: query,
                input_language: "English",
                output_language: "English",
                user_data: dataWithoutHeartRate,
            }
        });
        console.log("Full response:", response);
        res.json({ userId, response });
    } catch (error) {
        res.status(500).json({
            error: "Failed to process the request",
            details: error.message,
        });
    }
});
module.exports = router;

