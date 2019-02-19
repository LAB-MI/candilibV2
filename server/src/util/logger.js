import { createLogger, format, transports } from 'winston'

const isProd = process.env.NODE_ENV === 'production'
const isTest = process.env.NODE_ENV === 'test'

const options = {
  console: {
    level: isProd || isTest ? 'info' : 'debug',
    handleExceptions: true,
    json: false,
    colorize: true,
  },
}

const logJsonFormat = format.printf(({ level, message }) =>
  JSON.stringify({
    level,
    message,
    at: new Date().toISOString(),
  })
)

const logFormat = format.printf(({ level, message }) => `${level} ${message}`)

export const simpleLogger = createLogger({
  format: logFormat,
  transports: [new transports.Console(options.console)],
  exitOnError: false,
})

export const jsonLogger = createLogger({
  format: logJsonFormat,
  transports: [new transports.Console(options.console)],
  exitOnError: false,
})

const logger = isTest ? simpleLogger : jsonLogger

export const loggerStream = {
  write (message, encoding) {
    logger.info(message)
  },
}

export default logger
