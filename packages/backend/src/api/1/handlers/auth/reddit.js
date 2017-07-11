import crypto from 'crypto';
import express from 'express';
import passport from 'passport';

const router = express.Router();

router.get(
  '/',
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
  '/callback',
  (req, res, next) =>
    next(req.session.state !== req.query.state ? new Error(403) : undefined),
  (req, res, next) => {
    passport.authenticate('reddit', {
      successRedirect: `/api/v${req.apiVersion}/auth/finalize/success`,
      failureRedirect: `/api/v${req.apiVersion}/auth/finalize/failure`,
    })(req, res, next);
  }
);

module.exports = router;
