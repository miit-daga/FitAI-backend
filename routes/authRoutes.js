const express = require("express");
const passport = require("passport");
const { GetCommand } = require("@aws-sdk/lib-dynamodb");
const { dynamoDB, TABLE_NAME,TABLE_NAME_USER, USER_DETAILS} = require("../config/db");
const { QueryCommand } = require("@aws-sdk/lib-dynamodb");
const dotenv = require("dotenv");
const { BedrockRuntimeClient, InvokeModelCommand } = require("@aws-sdk/client-bedrock-runtime");
dotenv.config();
const bedrockAccessKeyId = process.env.BEDROCK_AWS_ACCESS_KEY_ID;
const bedrockSecretAccessKey = process.env.BEDROCK_AWS_SECRET_ACCESS_KEY;
const bedrockRegion = process.env.BEDROCK_AWS_REGION;


if (!bedrockAccessKeyId || !bedrockSecretAccessKey || !bedrockRegion) {
    console.warn("Bedrock AWS credentials or region might be missing in .env file.");
}

const router = express.Router();

router.get("/fitbit", passport.authenticate("fitbit"));

router.get(
    "/fitness/fitbit_redirect",
    passport.authenticate("fitbit", { failureRedirect: "/" }),
    (req, res) => {
        // res.redirect(`https://main.d2em8zim7rt0sl.amplifyapp.com/dashboard/${req.user.userId}`)
        res.redirect(`http://localhost:3000/dashboard/${req.user.userId}`)

    }
);

const fetchLatestFitnessData = async (userId) => {
    try {
        const result = await dynamoDB.send(new QueryCommand({
            TableName: TABLE_NAME,
            KeyConditionExpression: "userId = :userId",
            ExpressionAttributeValues: {
                ":userId": userId,
            },
            ScanIndexForward: false,
            Limit: 1,
        }));

        return result.Items.length > 0 ? result.Items[0] : null;
    } catch (error) {
        console.error("Error fetching latest fitness data:", error);
        throw error;
    }
};

const fetchUserDetails = async (userId) => {
    try {
        const result = await dynamoDB.send(new GetCommand({
            TableName: USER_DETAILS,
            Key: { userId }
        }));
        if (!result.Item) {
            return null;
        }
        return result.Item;
    } catch (error) {
        console.error("Error fetching user details:", error);
        throw error;
    }
};

const fetchUpdatedFitnessData = async (userId, maxRetries = 5, delayMs = 2000) => {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            const latestData = await fetchLatestFitnessData(userId);

            if (latestData) {
                return latestData;
            }

            await new Promise(resolve => setTimeout(resolve, delayMs));
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
            return res.json({ user, fitnessData });
        }
        const updatedData = await fetchUpdatedFitnessData(userId);
        res.json({ user, fitnessData: updatedData });
    } catch (error) {
        res.status(500).json({
            error: "Failed to fetch fitness data",
            details: error.message
        });
    }
});

router.post("/model", async (req, res) => {
    const { userId, query } = req.body;

    if (!userId) {
        return res.status(400).json({ error: "User ID is required" });
    }
    if (!query || typeof query !== "string" || query.trim() === "") {
        return res.status(400).json({ error: "Valid query is required" });
    }

    try {
        const bedrockClient = new BedrockRuntimeClient({
            region: bedrockRegion,
            credentials: {
                accessKeyId: bedrockAccessKeyId,
                secretAccessKey: bedrockSecretAccessKey,
            },
        });

        const updatedData = await fetchUpdatedFitnessData(userId);
        const detailUser = await fetchUserDetails(userId);

        if (!updatedData) {
            return res.status(404).json({ error: "Could not retrieve fitness data for user. Please try again after data syncs." });
        }

        const { heart_rate, ...dataForLlm } = updatedData;

        const userDetailsSection = `Here are the user's profile details and other data that the user has entered and hadn't come directly from fitbit API itself:\n${JSON.stringify(detailUser, null, 2)}`;

        const promptText = `You are a helpful fitness assistant analysing user data. User ID: ${userId}
        ${userDetailsSection}
        Here is the user's latest available fitness data:
        ${JSON.stringify(dataForLlm, null, 2)}
        Based only on the provided fitness data and profile information, answer the following user query:
        User Query: "${query}"
        Provide a concise and relevant answer. Do not make up information not present in the data.`;

        const mistralPayload = {
            prompt: `<s>[INST] ${promptText} [/INST]`,
            max_tokens: 4096,
            temperature: 0.7,
            top_p: 0.9,
        };


        const startTime = Date.now();

        const command = new InvokeModelCommand({
            modelId: "mistral.mistral-large-2402-v1:0",
            contentType: "application/json",
            accept: "application/json",
            body: JSON.stringify(mistralPayload),
        });

        const response = await bedrockClient.send(command);
        const duration = Date.now() - startTime;

        const responseBody = JSON.parse(new TextDecoder().decode(response.body));

        const responseText =
            responseBody.outputs?.[0]?.text ||
            responseBody.completion ||
            JSON.stringify(responseBody);

        res.json({ userId, response: responseText.trim() });
    } catch (error) {
        console.error(`[${userId}] Error in Mistral endpoint:`, error);
        res.status(500).json({
            error: "Failed to process the request with the Mistral model",
            details: error.message,
        });
    }
});

module.exports = router;

