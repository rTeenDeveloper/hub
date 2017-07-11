import express from 'express';
import passport from 'passport';

const router = express.Router();

router.get(
  '/',
  passport.authenticate('github', {
    scopes: ['user:email'],
  })
);

router.get('/callback', (req, res, next) => {
  passport.authenticate('github', {
    successRedirect: `/api/v${req.apiVersion}/auth/finalize/success`,
    failureRedirect: `/api/v${req.apiVersion}/auth/finalize/failure`,
  })(req, res, next);
});

module.exports = router;
