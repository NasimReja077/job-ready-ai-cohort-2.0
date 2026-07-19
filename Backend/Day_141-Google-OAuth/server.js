import { config } from 'dotenv';
import express from 'express';
import passport from 'passport';
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import morgan from 'morgan';

config();


// Initialize Express app
const app = express();

app.use(morgan('dev'));

app.get('/', (req, res) => {
    res.send('Hello World');
})

// Middleware to parse JSON requests
app.use(passport.initialize());

// Configure Google OAuth strategy
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "/auth/google/callback"
},(_, __, profile, done) => { // Callback function to handle the authenticated user
    return done(null, profile);
}));

app.get("/auth/google", 
    passport.authenticate("google", 
        { 
            scope: ["profile", "email"]
        }
    )
)

app.get("/auth/google/callback",
    passport.authenticate(
        "google",
        {
            session: false,
            failureRedirect: "/"
        }
    ),
    (req, res) => {
        console.log(req.user);
        res.send("Google Authentication Successfull");
    }
)

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
})