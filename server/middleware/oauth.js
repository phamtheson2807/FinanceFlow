const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;
const User = require('../models/User'); // Model User
const jwt = require('jsonwebtoken');
require('dotenv').config();

// Xử lý khi xác thực thành công
const handleAuth = async (profile, done) => {
  try {
    let user = await User.findOne({ email: profile.emails[0].value });

    if (!user) {
      user = new User({
        name: profile.displayName,
        email: profile.emails[0].value,
        avatar: profile.photos[0].value,
        role: 'user', // Mặc định là user
        provider: profile.provider, // Google/Facebook
      });
      await user.save();
    }

    const token = jwt.sign({ id: user._id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '7d' });
    return done(null, { user, token });
  } catch (err) {
    return done(err, null);
  }
};

// Google Strategy
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: '/api/auth/google/callback',
  profileFields: ['id', 'displayName', 'email', 'photos']
}, (accessToken, refreshToken, profile, done) => handleAuth(profile, done)));



module.exports = passport;
