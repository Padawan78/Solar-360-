const express = require('express');
const multer = require('multer');
const passport = require('passport');
const session = require('express-session');
const LocalStrategy = require('passport-local').Strategy;

const app = express();
const upload = multer({ dest: 'uploads/' });

// Dummy user for example
const users = [{ id: 1, username: 'user', password: 'pass' }];

// Setup session and passport
app.use(session({ secret: 'your-secret', resave: false, saveUninitialized: false }));
app.use(passport.initialize());
app.use(passport.session());
app.use(express.json());

// Passport local strategy
passport.use(new LocalStrategy(
  function(username, password, done) {
    const user = users.find(u => u.username === username && u.password === password);
    if (!user) return done(null, false);
    return done(null, user);
  }
));
passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser((id, done) => done(null, users.find(u => u.id === id)));

// Auth endpoint
app.post('/login', passport.authenticate('local'), (req, res) => {
  res.send('Logged in!');
});

// Middleware to check if authenticated
function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) return next();
  res.status(401).send('Not authenticated');
}

// PDF upload endpoint (authenticated only)
app.post('/upload', ensureAuthenticated, upload.single('pdf'), (req, res) => {
  res.send('PDF uploaded successfully!');
});

app.listen(3000, () => console.log('Server listening on port 3000'));