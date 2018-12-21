import { createLogger, format, transports } from 'winston'

const { combine } = format

const isProd = process.env.NODE_ENV === 'production'

const options = {
  console: {
    level: isProd ? 'warn' : 'debug',
    handleExceptions: true,
    json: false,
    colorize: true,
  },
}

const logFormat = format.printf(info => `${info.level}: ${info.message}\n`)

const logger = createLogger({
  format: combine(format.colorize(), logFormat),
  transports: [new transports.Console(options.console)],
  exitOnError: false,
})

export const loggerStream = {
  write: function (message, encoding) {
    // use the 'info' log level so the output will be picked up by both transports (file and console)
    logger.info(message)
  },
}

export default logger
