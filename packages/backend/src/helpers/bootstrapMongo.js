import path from 'path';
import chalk from 'chalk';
import mongoose from 'mongoose';
import MongoD from 'mongod';
import listFiles from 'recursive-readdir-sync';
import astra from './astra';
import logger from './mojilog';

function getDBUri() {
  let dbUri = `${astra.get('database.protocol', 'mongodb')}://`;
  if (astra.has('database.user')) {
    dbUri += astra.get('database.user');
    if (astra.has('database.password'))
      dbUri += `:${astra.get('database.password')}`;

    dbUri += '@';
  }
  dbUri += `${astra.get('database.host', 'localhost')}:${astra.get(
    'database.port',
    27017
  )}/${astra.get('database.dbname', 'rtd_hub_test')}`;
  return dbUri;
}

function bootstrapModel(basename, modelName, modelData) {
  logger.inProd(
    `Bootstrapping model ${chalk.white(modelName)} from ${chalk.white(
      basename
    )}`
  );
  mongoose.model(modelName, modelData);
}

function loadModels() {
  listFiles(path.join(__dirname, '..', 'schema'))
    .filter(item => !item.includes('__test__'))
    .forEach(modelContainer => {
      const basename = path.basename(modelContainer);
      // eslint-disable-next-line
    const schemaList = require(modelContainer);
      if (Array.isArray(schemaList))
        schemaList.forEach(schemaMeta => {
          const mountpoint = schemaMeta.name
            ? schemaMeta.name
            : basename.substr(0, basename.lastIndexOf('.'));
          bootstrapModel(basename, mountpoint, schemaMeta);
        });
      else
        bootstrapModel(
          basename,
          basename.substr(0, basename.lastIndexOf('.')),
          schemaList
        );
    });
}

export default async function initializeMongo(
  environment,
  serverConfiguration
) {
  if (serverConfiguration) {
    logger.inProd('Launching own MongoDB instance...');
    logger.inProd(
      `Server parameters provided: ${chalk.green(
        JSON.stringify(serverConfiguration)
      )}`
    );
    const mongoInstance = new MongoD(serverConfiguration);
    await mongoInstance.open();
    logger.inProd('MongoDB instance started!');
  }
  const dbUri = getDBUri();
  logger.inProd(`Using Mongo server URI: ${chalk.green(dbUri)}`);
  mongoose.Promise = global.Promise;
  await mongoose.connect(dbUri, {
    config: { autoIndex: environment !== 'production' },
  });
  logger.inProd('Connection to MongoDB established!');
  loadModels();
}
