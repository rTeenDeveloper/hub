import fs from 'fs';
import path from 'path';
import chalk from 'chalk';
import express from 'express';
import session from 'express-session';
import cors from 'cors';
import requestLogger from 'morgan';
import bodyParser from 'body-parser';
import listFiles from 'recursive-readdir-sync';
import passport from 'passport';
import mongoose from 'mongoose';
import initializeMongoSessionConnector from 'connect-mongo';

import packageFile from '../package.json';
import logger from './helpers/mojilog';
import astra from './helpers/astra';
import bootstrapMongo from './helpers/bootstrapMongo';
import createApiVersioningRouter from './helpers/createApiVersioningRouter';
import setupPassportStrategies from './helpers/setupPassportStrategies';

const routesPath = path.join(__dirname, 'routes');

passport.serializeUser((user, done) => {
  // TODO: serialize
  done(null, { userId: user._id });
});

passport.deserializeUser(async (sessionObject, done) => {
  // TODO: deserialize
  const User = mongoose.model('User');
  done(null, await User.findById(sessionObject.userId).exec());
});

function getConfigFolderPath(environment) {
  return path.join(__dirname, '..', '..', '..', 'config', environment);
}

const environmentOrder = ['development', 'test', 'ci', 'staging', 'production'];

// eslint-disable-next-line
export async function createServer(bind) {
  const environment = process.env.NODE_ENV || 'development';
  return new Promise(async (resolve, reject) => {
    try {
      console.log(
        `🚀  /r/TeenDeveloper community hub server v${chalk.green(
          packageFile.version
        )}`
      );

      logger.inProd('Loading configuration files into system...');
      const configurationEnvironments = environmentOrder.concat();
      configurationEnvironments.splice(
        configurationEnvironments.indexOf(environment) + 1,
        configurationEnvironments.length
      );

      logger.inTest(
        `Environments to apply: ${configurationEnvironments
          .map(item => chalk.white(item))
          .join(',')}`
      );

      const configFileSets = configurationEnvironments
        .filter(
          item =>
            item !== environment && fs.existsSync(getConfigFolderPath(item))
        )
        .map(item => listFiles(getConfigFolderPath(item)))
        .concat([listFiles(getConfigFolderPath(environment))]);

      Array.prototype.concat.apply([], configFileSets).forEach(file => {
        logger.inTest(`Loading configuration file: ${chalk.green(file)}`);
        astra.file(file);
      });

      const temporaryPersistencePath = path.join(
        __dirname,
        'config-persistence.json'
      );

      if (!fs.existsSync(temporaryPersistencePath)) {
        logger.inTest(
          'Creating configuration persistence file for new orphan keys...'
        );
        fs.writeFileSync(temporaryPersistencePath, '{}', { encoding: 'utf-8' });
      }

      logger.inTest('Restoring configuration persistence...');
      astra.file(temporaryPersistencePath);
      logger.inTest(`Loading environment variables into configuration...`);
      astra.env();

      logger.inProd('Initializing DB...');
      try {
        await bootstrapMongo(environment, astra.get('mongo.server'));
      } catch (e) {
        logger.ACHTUNG_ALL_BROKEN(`Failed to connect to MongoDB!`);
        logger.ACHTUNG_ALL_BROKEN(e);
        reject(e);
      }

      const app = express();
      app.set('environment', environment);
      app.set('x-powered-by', false);
      if (environment === 'production') app.set('trust proxy', 'loopback');
      logger.inProd('Connecting middleware...');
      const MongoSessionStore = initializeMongoSessionConnector(session);
      app.use(
        session({
          secret: astra.get('session.secret', 'XkCdBaTTeRySTApleCoRrEECt'),
          resave: true,
          saveUninitialized: false,
          store: new MongoSessionStore({
            mongooseConnection: mongoose.connection,
          }),
        })
      );
      app.use(passport.initialize());
      app.use(passport.session());
      app.use(cors({ origin: true, credentials: true }));
      setupPassportStrategies(passport);
      if (environment !== 'production') app.use(requestLogger('dev'));
      app.use(bodyParser.json());

      logger.inProd('Mounting API...');
      app.use('/api', createApiVersioningRouter(path.join(__dirname, 'api')));

      logger.inProd('Mounting routes...');
      listFiles(routesPath)
        .filter(item => !item.includes('__test__'))
        .forEach(routeHandler => {
          const rpath = `/${path
            .relative(routesPath, routeHandler)
            .replace('\\', '/')}`;
          // eslint-disable-next-line
        const tempRoute = require(routeHandler);
          const mountpoint = tempRoute.URL
            ? tempRoute.URL
            : rpath.substr(0, rpath.lastIndexOf('.')) || rpath;
          logger.inProd(
            chalk`Mounting {white ${rpath}} on {white ${mountpoint}}`
          );
          app.use(mountpoint, tempRoute);
        });

      app.get('/', (req, res) => {
        res.status(200);
        res.end();
      });
      app.get('/healthcheck', (req, res) =>
        res.json({ data: { healthy: true } })
      );

      const server = app.listen(bind, () => {
        console.log(`✅  Application bound and running`);
        server.closeDb = mongoose.disconnect;
        resolve(server);
      });
    } catch (e) {
      reject(e);
    }
  });
}
