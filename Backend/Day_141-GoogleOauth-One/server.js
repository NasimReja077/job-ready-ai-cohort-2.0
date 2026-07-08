import { config } from 'dotenv';
import express from 'express';
import passport from 'passport';
import { Strategy as GoogleStrategy } from "passport-google-oauth20"
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

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "/auth/google/callback"
}, (_, __, profile, done) => {
    return done(null, profile);
}))

// Route to initiate Google OAuth authentication
app.get("/auth/google",
    passport.authenticate("google", { scope: [ "profile", "email" ] })
)

// Route to handle Google OAuth callback
app.get('/auth/google/callback',
    passport.authenticate('google', {
        session: false,
        failureRedirect: '/'
    }),
    (req, res) => {
        console.log(req.user)
        res.send('Google authentication successful');
    }
)

app.listen(3000, () => {
    console.log('Server is running on port 3000');
})