// const passport = require("passport");
// const FitbitStrategy = require("passport-fitbit-oauth2").FitbitOAuth2Strategy;
// const { PutCommand, GetCommand } = require("@aws-sdk/lib-dynamodb");
// const { dynamoDB, TABLE_NAME_USER } = require("../config/db"); // Import correct table
// require("dotenv").config();

// passport.use(
//     new FitbitStrategy(
//         {
//             clientID: process.env.FITBIT_CLIENT_ID,
//             clientSecret: process.env.FITBIT_CLIENT_SECRET,
//             callbackURL: process.env.FITBIT_CALLBACK_URL,
//             scope: ["activity", "heartrate", "sleep", "nutrition", "profile"],
//         },
//         async (accessToken, refreshToken, profile, done) => {
//             try {
//                 const userId = profile.id; // Fitbit user ID

//                 // Check if the user already exists
//                 const existingUser = await dynamoDB.send(
//                     new GetCommand({
//                         TableName: TABLE_NAME_USER,
//                         Key: { userId }
//                     })
//                 );

//                 if (!existingUser.Item) {
//                     // If user does not exist, insert into Users table
//                     const userData = {
//                         userId,
//                         displayName: profile.displayName,
//                         accessToken,
//                         refreshToken,
//                         createdAt: new Date().toISOString(),
//                     };

//                     await dynamoDB.send(
//                         new PutCommand({
//                             TableName: TABLE_NAME_USER,
//                             Item: userData,
//                         })
//                     );

//                     console.log("New user saved to Users table:", userData);
//                 } else {
//                     console.log("User already exists, skipping insertion.");
//                 }

//                 return done(null, { userId, accessToken, refreshToken });
//             } catch (error) {
//                 console.error("Error saving user to Users table:", error);
//                 return done(error, null);
//             }
//         }
//     )
// );

// passport.serializeUser((user, done) => {
//     done(null, user);
// });

// passport.deserializeUser((user, done) => {
//     done(null, user);
// });
const passport = require("passport");
const FitbitStrategy = require("passport-fitbit-oauth2").FitbitOAuth2Strategy;
const { PutCommand, GetCommand } = require("@aws-sdk/lib-dynamodb");
const { InvokeCommand, LambdaClient } = require("@aws-sdk/client-lambda");
const { dynamoDB, TABLE_NAME_USER } = require("../config/db");
require("dotenv").config();

// Initialize AWS Lambda Client
const lambdaClient = new LambdaClient({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
});

// Function to invoke Lambda
const invokeWorkerLambda = async (userId, accessToken) => {
    try {
        const payload = JSON.stringify({ userId, accessToken });

        const command = new InvokeCommand({
            FunctionName: "worker", // Name of your Lambda function
            Payload: Buffer.from(payload),
            InvocationType: "Event", // Event mode (asynchronous execution)
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
            scope: ["activity", "heartrate", "sleep", "nutrition", "profile"],
        },
        async (accessToken, refreshToken, profile, done) => {
            try {
                const userId = profile.id; // Fitbit user ID

                // Check if the user already exists
                const existingUser = await dynamoDB.send(
                    new GetCommand({
                        TableName: TABLE_NAME_USER,
                        Key: { userId }
                    })
                );

                if (!existingUser.Item) {
                    // New user - Insert into Users table
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

                    console.log("New user saved to Users table:", userData);
                } else {
                    console.log("User already exists, skipping insertion.");
                }

                // ✅ Invoke Worker Lambda function asynchronously
                invokeWorkerLambda(userId, accessToken);

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
