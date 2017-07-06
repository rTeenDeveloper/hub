import crypto from 'crypto';
import express from 'express';
import passport from 'passport';

const router = express.Router();

router.get(
  '/reddit',
  (req, res, next) => {
    // this is the callback from Reddit
    if (req.query.state !== undefined && req.query.state === req.session.state)
      passport.authenticate('reddit', {
        successRedirect: '/api/v1/auth/reddit',
        failureRedirect: '/api/v1/auth/login_failure',
      })(req, res, next);
    else next();
  },
  // this is the case where the user is already logged in
  (req, res, next) => {
    if (req.isAuthenticated() === false) next();
    else {
      res.write('You seem to be already authenticated!\n');
      res.write(JSON.stringify(req.user));
      res.end();
      next('route');
    }
  },
  // this initiates a new authentication request from Reddit
  (req, res, next) => {
    if (req.session.state === undefined)
      req.session.state = crypto.randomBytes(32).toString('hex');
    passport.authenticate('reddit', {
      state: req.session.state,
      duration: 'permanent',
    })(req, res, next);
  }
);

router.get('/login_failure', (req, res) => {
  // TODO: write proper implementation
  res.write("Sorry we couldn't find your user.\n");
  res.write(
    'The server is configured to only accept the user 11et right now.\n'
  );
  res.end();
});

module.exports = router;
