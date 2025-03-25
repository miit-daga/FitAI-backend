const passport = require("passport");
const FitbitStrategy = require("passport-fitbit-oauth2").FitbitOAuth2Strategy;
const axios = require("axios");
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

                return done(null, userData);
            } catch (error) {
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
