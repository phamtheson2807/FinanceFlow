const bcrypt = require('bcryptjs');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');
const jwt = require('jsonwebtoken');
require('dotenv').config();

// Serialize và deserialize user
passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((user, done) => {
  done(null, user);
});

// Google Strategy
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL || 'http://localhost:5000/api/auth/google/callback',
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        console.log('📱 Google profile:', profile); // Thêm log để debug

        if (!profile || !profile.emails || !profile.emails[0]) {
          console.error('❌ Không nhận được thông tin email từ Google');
          return done(null, false, { message: 'Không thể lấy email từ Google' });
        }

        let user = await User.findOne({ email: profile.emails[0].value });

        if (!user) {
          const salt = await bcrypt.genSalt(10);
          const hashedPassword = await bcrypt.hash('google-' + Date.now(), salt);
          
          user = new User({
            name: profile.displayName,
            email: profile.emails[0].value,
            avatar: profile.photos?.[0]?.value || null,
            isVerified: true,
            password: hashedPassword,
            role: 'user',
            isLocked: false,
            googleId: profile.id,
            provider: 'google',
          });
          
          try {
            await user.save();
            console.log('✅ Tạo user Google mới thành công:', user.email);
          } catch (saveError) {
            console.error('❌ Lỗi khi lưu user mới:', saveError);
            return done(saveError);
          }
        }

        // Trả về thông tin cần thiết
        return done(null, {
          id: profile.id,
          email: profile.emails[0].value,
          displayName: profile.displayName
        });

      } catch (error) {
        console.error('❌ Lỗi xử lý Google OAuth:', error);
        return done(error);
      }
    }
  )
);

module.exports = passport;