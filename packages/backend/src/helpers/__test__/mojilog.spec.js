/* eslint-disable no-undef */
import chalk from 'chalk';
import logger from '../mojilog';

describe('mojilog', () => {
  beforeEach(() => {
    global.console = {
      warn: jest.fn(),
      log: jest.fn(),
      error: jest.fn(),
    };
  });

  describe('.inProd()', () => {
    test('logs to the console', () => {
      logger.inProd('test');
      expect(global.console.log).toBeCalledWith(
        `${chalk.bold.bgGreen.inverse(' INFO ')} ${chalk.green('test')}`
      );
    });
  });

  describe('.inTest()', () => {
    test('logs to the console on environments different from production', () => {
      logger.inTest('test');
      expect(global.console.log).toBeCalledWith(
        `${chalk.bold.bgMagenta.inverse(' VERB ')} ${chalk.magenta('test')}`
      );
    });

    test('does not log to the console on production', () => {
      process.env.NODE_ENV = 'production';
      logger.inTest('test');
      expect(global.console.log).not.toBeCalled();
    });
  });

  describe('.toInvestigate()', () => {
    test('logs message to the console', () => {
      logger.toInvestigate('test');
      expect(global.console.warn).toBeCalledWith(
        `${chalk.bold.bgYellow.inverse(' WARN ')} ${chalk.yellow('test')}`
      );
    });
    test('logs error to the console', () => {
      const err = new Error('');
      logger.toInvestigate(err);
      expect(global.console.warn).toBeCalledWith(
        logger
          .formatError(err)
          .map(
            item =>
              `${chalk.bold.bgYellow.inverse(' WARN ')} ${chalk.yellow(item)}`
          )
          .join('\n')
      );
    });
  });

  describe('.ACHTUNG_ALL_BROKEN()', () => {
    test('logs message to the console', () => {
      logger.ACHTUNG_ALL_BROKEN('test');
      expect(global.console.error).toBeCalledWith(
        `${chalk.bold.bgRedBright.inverse(' ERR  ')} ${chalk.redBright('test')}`
      );
    });
    test('logs error to the console', () => {
      const err = new Error('');
      logger.ACHTUNG_ALL_BROKEN(err);
      expect(global.console.error).toBeCalledWith(
        logger
          .formatError(err)
          .map(
            item =>
              `${chalk.bold.bgRedBright.inverse(' ERR  ')} ${chalk.redBright(
                item
              )}`
          )
          .join('\n')
      );
    });
  });

  describe('.formatError()', () => {
    test('transforms exception to array of strings', () => {
      const err = new Error();
      expect(logger.formatError(err)).toEqual([
        '--- STACKTRACE START ---',
        ...err.stack.split('\n'),
        '--- STACKTRACE END ---',
      ]);
    });
  });
});
