import { createServer } from './server';
import logger from './helpers/mojilog';

process.on('uncaughtException', ::logger.ACHTUNG_ALL_BROKEN);

try {
  createServer(3000);
} catch (e) {
  logger.ACHTUNG_ALL_BROKEN(`Failed to launch application server:`);
  logger.ACHTUNG_ALL_BROKEN(e);
}
