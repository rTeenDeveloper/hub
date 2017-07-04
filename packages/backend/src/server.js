import chalk from 'chalk';
import express from 'express';
import session from 'express-session';
import cors from 'cors';
import path from 'path';
import requestLogger from 'morgan';
import bodyParser from 'body-parser';
import listFiles from 'recursive-readdir-sync';
import passport from 'passport';

import packageFile from '../package.json';
import logger from './helpers/mojilog';
import createApiVersioningRouter from './helpers/createApiVersioningRouter';

const routesPath = path.join(__dirname, 'routes');

// eslint-disable-next-line
export function createServer(bind) {
  const environment = process.env.NODE_ENV || 'development';
  return new Promise(resolve => {
    console.log(
      `🚀  /r/TeenDeveloper community hub server v${chalk.green(
        packageFile.version
      )}`
    );
    const app = express();
    app.set('environment', environment);
    if (environment === 'production') app.set('trust proxy', 'loopback');
    app.set('x-powered-by', false);

    logger.inProd('Initializing DB...');

    logger.inProd('Connecting middleware...');
    app.use(session({ secret: 'XkCdBaTTeRySTApleCoRrEECt' }));
    app.use(passport.initialize());
    app.use(passport.session());
    app.use(cors({ origin: true, credentials: true }));
    if (environment === 'development') app.use(requestLogger('dev'));
    app.use(bodyParser.json());

    logger.inProd('Mounting API...');
    app.get('/api', createApiVersioningRouter(path.join(__dirname, 'api')));

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
      resolve(server);
    });
  });
}
