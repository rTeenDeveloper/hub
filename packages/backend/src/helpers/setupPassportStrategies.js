const RedditStrategy = require('passport-reddit').Strategy;

const setupPassportStrategies = passport => {
  passport.use(
    new RedditStrategy(
      {
        clientID: 'rWjd7fOjL7eq3w',
        clientSecret: 'P25JnVRYKYLXbV76sE3BUtQ5nJM',
        callbackURL: 'http://127.0.0.1:3000/api/v1/auth/reddit/callback',
      },
      (accessToken, refreshToken, profile, done) => {
        // TODO: implement db lookup
        if (profile.name === '11et')
          return done(null, { id: profile.id, redditUsername: profile.name });
        return done(null, false);
      }
    )
  );
};

module.exports = setupPassportStrategies;
