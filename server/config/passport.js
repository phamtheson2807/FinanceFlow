const passport = require('passport');
// const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Add these serialization methods
passport.serializeUser((user, done) => {
    done(null, user);
});

passport.deserializeUser((user, done) => {
    done(null, user);
});

/*
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URL
}, async (accessToken, refreshToken, profile, done) => {
    try {
        let user = await User.findOne({ email: profile.emails[0].value });

        if (!user) {
            user = new User({
                name: profile.displayName,
                email: profile.emails[0].value,
                isVerified: true,
                password: null,
                role: 'user',
                isLocked: false
            });
            await user.save();
        }

        if (!user.isVerified) {
            return done(null, false, { message: 'Email chưa xác thực' });
        }

        return done(null, user);
    } catch (error) {
        console.error('❌ Lỗi đăng nhập Google:', error);
        return done(error, false);
    }
}));
*/

module.exports = passport;
