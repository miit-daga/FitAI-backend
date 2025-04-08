const passport = require("passport");
const FitbitStrategy = require("passport-fitbit-oauth2").FitbitOAuth2Strategy;
const { PutCommand, GetCommand } = require("@aws-sdk/lib-dynamodb");
const { InvokeCommand, LambdaClient } = require("@aws-sdk/client-lambda");
const { dynamoDB, TABLE_NAME_USER } = require("../config/db");
require("dotenv").config();

const lambdaClient = new LambdaClient({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
});

const invokeWorkerLambda = async (userId, accessToken) => {
    try {
        const payload = JSON.stringify({ userId, accessToken });

        const command = new InvokeCommand({
            FunctionName: "worker",
            Payload: Buffer.from(payload),
            InvocationType: "Event",
        });

        await lambdaClient.send(command);
        console.log(`Worker Lambda invoked for user: ${userId}`);
    } catch (error) {
        console.error("Error invoking Worker Lambda:", error);
    }
};

passport.use(
    new FitbitStrategy(
        {
            clientID: process.env.FITBIT_CLIENT_ID,
            clientSecret: process.env.FITBIT_CLIENT_SECRET,
            callbackURL: process.env.FITBIT_CALLBACK_URL,
            scope: ["activity", "heartrate", "sleep", "nutrition", "profile","oxygen_saturation"],
        },
        async (accessToken, refreshToken, profile, done) => {
            try {
                const userId = profile.id;

                const existingUser = await dynamoDB.send(
                    new GetCommand({
                        TableName: TABLE_NAME_USER,
                        Key: { userId }
                    })
                );

                if (!existingUser.Item) {
                    const userData = {
                        userId,
                        displayName: profile.displayName,
                        accessToken,
                        refreshToken,
                        createdAt: new Date().toISOString(),
                    };

                    await dynamoDB.send(
                        new PutCommand({
                            TableName: TABLE_NAME_USER,
                            Item: userData,
                        })
                    );
                } else {
                    console.log("User already exists, skipping insertion.");
                }

                await invokeWorkerLambda(userId, accessToken);

                return done(null, { userId, accessToken, refreshToken });
            } catch (error) {
                console.error("Error saving user to Users table:", error);
                return done(error, null);
            }
        }
    )
);

passport.serializeUser((user, done) => {
    done(null, user);
});

passport.deserializeUser((user, done) => {
    done(null, user);
});
