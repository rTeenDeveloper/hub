import crypto from 'crypto';
import express from 'express';
import passport from 'passport';

var router = express.Router();

router.get('/reddit/callback', function(req, res, next) {
    // Check for origin via state token
    if (req.query.state == req.session.state) {
        passport.authenticate('reddit', {
            successRedirect: '/auth_status',
            failureRedirect: '/login_failure',
        })(req, res, next);
    } else {
        next(new Error(403));
    }
});

router.get('/reddit', function(req, res, next) {
    if (!req.session.state) {
      req.session.state = crypto.randomBytes(32).toString('hex');
    }
    passport.authenticate('reddit', {
        state: req.session.state,
        duration: 'permanent',
    })(req, res, next)
});

module.exports = router;
