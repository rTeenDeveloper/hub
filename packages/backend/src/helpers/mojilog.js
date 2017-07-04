import chalk from 'chalk';

export default class Logger {
  static inProd(msg) {
    console.log(`🖥  ${chalk.cyan(msg)}`);
  }

  static inTest(msg) {
    if (process.env.NODE_ENV !== 'production')
      console.log(`🔬  ${chalk.blue(msg)}`);
  }

  static toInvestigate(msg) {
    if (msg instanceof Error)
      return Logger.formatError(msg).forEach(::Logger.toInvestigate);
    return console.warn(chalk.bgYellow(`⚠️  ${chalk.bold.black(msg)}`));
  }

  static ACHTUNG_ALL_BROKEN(err) {
    if (err instanceof Error)
      return Logger.formatError(err).forEach(::Logger.ACHTUNG_ALL_BROKEN);
    return console.error(chalk.bgRedBright(`💀  ${chalk.bold.black(err)}`));
  }

  static formatError(err) {
    return [
      '--- STACKTRACE START ---',
      ...err.stack.split('\n'),
      '--- STACKTRACE END ---',
    ];
  }
}
