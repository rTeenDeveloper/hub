import chalk from 'chalk';

export default class Logger {
  static inProd(msg) {
    console.log(Logger.formatString(' INFO ', msg, 'green'));
  }

  static formatString(tag, string, color) {
    return `${chalk.bold[
      `bg${color.substr(0, 1).toUpperCase()}${color.substr(1)}`
    ].inverse(tag)} ${chalk[color](string)}`;
  }

  static inTest(msg) {
    if (process.env.NODE_ENV !== 'production')
      console.log(Logger.formatString(' VERB ', msg, 'magenta'));
  }

  static toInvestigate(msg) {
    if (msg instanceof Error)
      return console.warn(
        Logger.formatError(msg)
          .map(item => `${Logger.formatString(' WARN ', item, 'yellow')}`)
          .join('\n')
      );
    return console.warn(Logger.formatString(' WARN ', msg, 'yellow'));
  }

  static ACHTUNG_ALL_BROKEN(err) {
    if (err instanceof Error)
      return console.error(
        Logger.formatError(err)
          .map(item => `${Logger.formatString(' ERR  ', item, 'redBright')}`)
          .join('\n')
      );
    return console.error(Logger.formatString(' ERR  ', err, 'redBright'));
  }

  static formatError(err) {
    return [
      '--- STACKTRACE START ---',
      ...err.stack.split('\n'),
      '--- STACKTRACE END ---',
    ];
  }
}
