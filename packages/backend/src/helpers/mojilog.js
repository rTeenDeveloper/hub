import chalk from 'chalk';

export default class Logger {
  static inProd(msg) {
    console.log(`${chalk.bold.green.inverse(' INFO ')} ${chalk.green(msg)}`);
  }

  static inTest(msg) {
    if (process.env.NODE_ENV !== 'production')
      console.log(
        `${chalk.bold.magenta.inverse(' VERB ')} ${chalk.magenta(msg)}`
      );
  }

  static toInvestigate(msg) {
    if (msg instanceof Error)
      return Logger.formatError(msg).forEach(::Logger.toInvestigate);
    return console.warn(
      `${chalk.bold.yellow.inverse(' WARN ')} ${chalk.yellow(msg)}`
    );
  }

  static ACHTUNG_ALL_BROKEN(err) {
    if (err instanceof Error)
      return Logger.formatError(err).forEach(::Logger.ACHTUNG_ALL_BROKEN);
    return console.error(
      `${chalk.bold.redBright.inverse(' ERR  ')} ${chalk.redBright(err)}`
    );
  }

  static formatError(err) {
    return [
      '--- STACKTRACE START ---',
      ...err.stack.split('\n'),
      '--- STACKTRACE END ---',
    ];
  }
}
