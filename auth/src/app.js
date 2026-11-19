import "dotenv/config";
import express from "express";
import jwt from "jsonwebtoken";
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import userModel from "./models/user.model.js";
import { sendAuthNotification } from "./service/mq.js";

const app = express();

app.use(passport.initialize());

// Configure Passport to use Google OAuth 2.0 strategy
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "/auth/google/callback",
    },
    function (accessToken, refreshToken, profile, done) {
      return done(null, profile);
    },
  ),
);

// Route to initiate Google OAuth flow
app.get(
  "/auth/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
    session: false,
  }),
);

// Callback route that Google will redirect to after authentication
app.get(
  "/auth/google/callback",
  passport.authenticate("google", { session: false }),
  async (req, res) => {

    // Generate a JWT for the authenticated user    
    const token = jwt.sign(
      { id: req.user.id, displayName: req.user.displayName },
      process.env.JWT_SECRET,
      { expiresIn: "7d" },
    );

    const user = await userModel.findOne({ googleId: req.user.id });
    if(!user) {
      const newUser = new userModel({
        googleId: req.user.id,
        displayName: req.user.displayName,
        email: req.user.emails?.[0]?.value,
      });
      await newUser.save();
    }

    await sendAuthNotification({
      userId: req.user.id,
      displayName: req.user.displayName,
      email: req.user.emails?.[0]?.value,
      action: "Gooogle OAuth Login",
      timestamp: new Date().toISOString(),
    })

    // Send the token to the client
    res.json({ token });
  },
);

app.get("/_status/healthz", (req, res) => {
  res.status(200).json({ status: "ok" });
}); 

app.get("/_status/readyz", (req, res) => {
  res.status(200).json({ status: "ready" });
});

export default app;
