// const passport = require("passport");
// const FitbitStrategy = require("passport-fitbit-oauth2").FitbitOAuth2Strategy;
// const axios = require("axios");
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
//                 const userData = {
//                     id: profile.id,
//                     displayName: profile.displayName,
//                     accessToken,
//                     refreshToken,
//                 };
//                 console.log("User data:", userData);
//                 return done(null, userData);
//             } catch (error) {
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
const { dynamoDB, TABLE_NAME_USER } = require("../config/db"); // Import correct table
require("dotenv").config();

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
                    // If user does not exist, insert into Users table
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
