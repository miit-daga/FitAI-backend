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
const { PutCommand } = require("@aws-sdk/lib-dynamodb");
const dynamoDB = require("../config/dynamoDB"); // Import DynamoDB client
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
                const userData = {
                    id: profile.id,
                    displayName: profile.displayName,
                    accessToken,
                    refreshToken,
                };

                console.log("User data:", userData);

                // **Save user to DynamoDB**
                await dynamoDB.send(
                    new PutCommand({
                        TableName: "FitAI_Users", // Change to your table name
                        Item: {
                            userId: userData.id,
                            displayName: userData.displayName,
                            accessToken: userData.accessToken,
                            refreshToken: userData.refreshToken,
                            createdAt: new Date().toISOString(),
                        },
                    })
                );

                console.log("User saved to DynamoDB");
                return done(null, userData);
            } catch (error) {
                console.error("Error saving user to DynamoDB:", error);
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
