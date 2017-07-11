import mongoose from 'mongoose';
import uuidv4 from 'uuid/v4';
import { Strategy as RedditStrategy } from 'passport-reddit';
import { Strategy as GithubStrategy } from 'passport-github2';
import astra from './astra';
import logger from './mojilog';
import getHostUrl from './getHostUrl';

function createAuthenticationProcessor(
  authSystem,
  profileIdSelector = profile => profile.id,
  profileUsernameSelector = profile => profile.name
) {
  const User = mongoose.model('User');
  return async (req, accessToken, refreshToken, profile, done) => {
    logger.inTest(`PASSPORT: Auth system: ${authSystem}, profile: `);
    logger.inTest(JSON.stringify(profile, null, 2));
    if (req.isAuthenticated()) {
      req.user.set(authSystem, {
        uid: profileIdSelector(profile),
        username: profileUsernameSelector(profile),
        accessToken,
        accessTokenExpiration: 0, // FIXME: as of now expiration is not really needed, so it's 0
      });
      try {
        const user = await req.user.save();
        return done(null, user);
      } catch (e) {
        logger.toInvestigate(`PASSPORT: MongoDB Error while saving user:`);
        logger.toInvestigate(e);
        return done(e, req.user);
      }
    } else {
      let userCandidate;
      try {
        userCandidate = await User.findOne({
          [`${authSystem}.uid`]: profileIdSelector(profile),
        });
        // eslint-disable-next-line
      } catch (ignored) {}
      if (!userCandidate)
        // create basic user, redirect to user edit page
        try {
          const user = await new User({
            username: uuidv4(),
            [authSystem]: {
              uid: profileIdSelector(profile),
              username: profileUsernameSelector(profile),
              accessToken,
              accessTokenExpiration: 0, // FIXME: as of now expiration is not really needed, so it's 0
            },
          }).save();
          return done(null, user);
        } catch (e) {
          logger.toInvestigate(
            `PASSPORT: MongoDB Error while creating user account:`
          );
          logger.toInvestigate(e);
          return done(e, null);
        }
      else return done(null, userCandidate);
    }
  };
}

export function initializeStrategy(
  Strategy,
  strategyName,
  profileIdSelector,
  profileUsernameSelector
) {
  return new Strategy(
    {
      clientID: astra.get(`oauth.${strategyName}.clientId`),
      clientSecret: astra.get(`oauth.${strategyName}.clientSecret`),
      callbackURL: `${getHostUrl()}/api/v1/auth/${strategyName}/callback`, // FIXME: Figure out something about hardcoding API version here
      passReqToCallback: true,
    },
    createAuthenticationProcessor(
      strategyName,
      profileIdSelector,
      profileUsernameSelector
    )
  );
}

export default function setupPassportStrategies(passport) {
  try {
    passport.use(
      initializeStrategy(
        RedditStrategy,
        'reddit',
        profile => profile.id,
        profile => profile.name
      )
    );
  } catch (e) {
    logger.toInvestigate(
      'PASSPORT: Error when initializing Reddit integration. It will not be available'
    );
    logger.toInvestigate(e);
  }
  try {
    passport.use(
      initializeStrategy(
        GithubStrategy,
        'github',
        profile => profile.id,
        profile => profile.username
      )
    );
  } catch (e) {
    logger.toInvestigate(
      'PASSPORT: Error when initializing Github integration. It will not be available'
    );
    logger.toInvestigate(e);
  }
}
