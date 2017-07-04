import fs from 'fs';
import path from 'path';
import chalk from 'chalk';
import express from 'express';
import listFiles from 'recursive-readdir-sync';
import logger from './mojilog';

const apiResolverCache = {};
const apiMapCache = {};

function getApiMethodList(apiRootDirectory, apiVersion, minVersion) {
  if (apiVersion < minVersion) return {};
  if (apiResolverCache[apiVersion.toString()])
    return apiResolverCache[apiVersion.toString()];
  let apiConfig = {
    deleted: [],
  };
  try {
    logger.inTest(
      `Trying to read API configuration file for API ${chalk.green(
        `v${apiVersion}`
      )}`
    );
    // eslint-disable-next-line
    apiConfig = require(path.join(
      apiRootDirectory,
      apiVersion.toString(),
      'apiConfiguration'
    ));
    logger.inTest(
      `API configuration: ${chalk.green(JSON.stringify(apiConfig))}`
    );
  } catch (e) {
    logger.inTest('API configuration file not found, using default...');
  }
  const handlersDirectory = path.join(
    apiRootDirectory,
    apiVersion.toString(),
    'handlers'
  );
  const handlers = {};
  const previousVersionHandlers = Object.assign(
    {},
    getApiMethodList(apiRootDirectory, apiVersion - 1, minVersion)
  );
  logger.inTest(`Reading files from ${handlersDirectory}`);
  const handlersCandidateList = listFiles(handlersDirectory)
    .filter(item => !item.includes('__test__'))
    .map(file => {
      const precompiledMountpoint = `/${path
        .relative(handlersDirectory, file)
        .replace('\\', '/')}`;
      return [
        precompiledMountpoint.substr(0, precompiledMountpoint.lastIndexOf('.')),
        file,
      ];
    });

  Object.assign.apply(
    null,
    [handlers].concat(
      handlersCandidateList.map(kvpair => ({ [kvpair[0]]: kvpair[1] }))
    )
  );

  apiResolverCache[apiVersion.toString()] = handlers;

  logger.inTest(
    `Filtering routes depending on routing configuration for API ${chalk.green(
      `v${apiVersion}`
    )}...`
  );

  Object.keys(previousVersionHandlers).forEach(handler => {
    const filteredHandler = handler.substr(1);
    apiConfig.deleted.forEach(matcher => {
      if (
        (matcher instanceof RegExp && matcher.test(filteredHandler)) ||
        (typeof matcher === 'string' && matcher === filteredHandler)
      ) {
        logger.inTest(
          `Removing ${chalk.green(filteredHandler)} in API ${chalk.green(
            `v${apiVersion}`
          )}...`
        );
        delete previousVersionHandlers[matcher];
      }
    });
  });

  const finalApiHandlers = Object.assign({}, previousVersionHandlers, handlers);
  apiMapCache[apiVersion.toString()] = finalApiHandlers;
  return finalApiHandlers;
}

function createRouterFromMapping(mapping) {
  const apiRouter = express.Router();
  Object.keys(mapping).forEach(key => {
    // eslint-disable-next-line
    const routeHandlerCandidate = require(mapping[key]);
    // honestly a very dirty check, but still works for now
    if (routeHandlerCandidate.constructor !== apiRouter.constructor) {
      logger.toInvestigate(
        `Route ${key} from ${mapping[
          key
        ]} cannot be applied: not a router instance`
      );
      return;
    }
    logger.inTest(`Mounting ${chalk.green(key)}...`);
    routeHandlerCandidate.mountpoint = `/${key}`;
    apiRouter.use(key, routeHandlerCandidate);
  });
  return apiRouter;
}

function bootstrapApi(apiRootDirectory, version, minVersion, router) {
  if (version < minVersion) return router;
  logger.inProd(`Bootstrapping API ${chalk.green(`v${version}`)}`);
  router.use(
    `/v${version}`,
    createRouterFromMapping(
      getApiMethodList(apiRootDirectory, version, minVersion)
    )
  );
  return bootstrapApi(apiRootDirectory, version - 1, minVersion, router);
}

export default function createApiVersioningRouter(apiRootDirectory) {
  logger.inProd('Initializing REST API...');
  const versions = fs.readdirSync(apiRootDirectory);
  logger.inTest(
    `API versions found: ${versions
      .map(version => chalk`{green v${version}}`)
      .join(', ')}`
  );
  versions.sort((a, b) => a < b);
  const router = bootstrapApi(
    apiRootDirectory,
    versions[0],
    versions[versions.length - 1],
    express.Router()
  );
  if (!process.env.NODE_ENV || process.env.NODE_ENV === 'development') {
    logger.inTest(`Building API map...`);
    Object.keys(apiMapCache).forEach(apiVersion => {
      logger.inTest(` v${apiVersion}`);
      Object.keys(apiMapCache[apiVersion]).forEach(route =>
        logger.inTest(`  - /v${apiVersion}${route}`)
      );
    });
  }

  return router;
}
