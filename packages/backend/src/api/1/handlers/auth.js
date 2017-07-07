import crypto from 'crypto';
import express from 'express';
import passport from 'passport';

const router = express.Router();

router.get(
  '/reddit',
  // TOOD: implment case when user is already authenticated
  (req, res, next) => {
    if (req.session.state === undefined)
      req.session.state = crypto.randomBytes(32).toString('hex');
    passport.authenticate('reddit', {
      state: req.session.state,
      duration: 'permanent',
    })(req, res, next);
  }
);

router.get(
  '/reddit/callback',
  (req, res, next) =>
    next(req.session.state !== req.query.state ? new Error(403) : undefined),
  passport.authenticate('reddit', {
    successRedirect: '/api/v1/auth/reddit',
    failureRedirect: '/api/v1/auth/login_failure',
  })
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
