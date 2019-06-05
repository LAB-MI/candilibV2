import { createLogger, format, transports } from 'winston'
const { combine, timestamp, label, printf } = format

const isProd = process.env.NODE_ENV === 'production'
const isTest = process.env.NODE_ENV === 'test'

const TECH_LABEL = 'tech'
const APP_LABEL = 'app'

const level = isProd ? 'info' : isTest ? 'warn' : 'debug'

const options = {
  console: {
    level,
    json: false,
    colorize: !isProd,
  },
}

const logJsonFormat = printf(({ label, level, message, timestamp }) => {
  return JSON.stringify({
    content: typeof message === 'string' ? { default: message } : message,
    meta: {
      level,
      label,
      timestamp,
    },
  })
})

const logFormat = printf(({ level, message }) => `${level} ${message}`)

const simplestFormat = printf(({ message }) => message)

export const formatAsNginx =
  ':remote-addr - :remote-user [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent" :response-time'

export function jsonFormat(tokens, req, res) {
  return JSON.stringify({
    api: {
      'time_local': tokens.date(req, res, 'iso'),
      'method': tokens.method(req, res),
      'request_uri': tokens.url(req, res),
      'uri': tokens.url(req, res),
      'status': tokens.status(req, res),
      'content_length': tokens.res(req, res, 'content-length'),
      'http_referrer': tokens.referrer(req, res),
      'http_version': tokens['http-version'](req, res),
      'remote_addr': tokens['remote-addr'](req, res),
      'remote_user': tokens['remote-user'](req, res),
      'http_user_agent': tokens['user-agent'](req, res),
      'response_time': tokens['response-time'](req, res),
    }
  });
}

export const getRequestLogAsJson = (tokens, req, res) => {
  return [
    tokens.method(req, res),
    tokens.url(req, res),
    tokens.status(req, res),
    tokens.res(req, res, 'content-length'), '-',
    tokens['response-time'](req, res), 'ms'
  ].join(' ')
}

export const simpleLogger = createLogger({
  format: logFormat,
  transports: [new transports.Console(options.console)],
  exitOnError: false,
})

export const simplestLogger = createLogger({
  format: simplestFormat,
  transports: [new transports.Console(options.console)],
  exitOnError: false,
})

export const techLogger = createLogger({
  format: combine(
    label({ label: TECH_LABEL }),
    timestamp(),
    isTest ? logFormat : logJsonFormat
  ),
  transports: [new transports.Console(options.console)],
  exitOnError: false,
})

export const morganLogger = createLogger({
  format: combine(
    label({ label: TECH_LABEL }),
    timestamp(),
    simplestFormat,
  ),
  transports: [new transports.Console(options.console)],
  exitOnError: false,
})

export const appLogger = createLogger({
  format: combine(
    label({ label: APP_LABEL }),
    timestamp(),
    isTest ? logFormat : logJsonFormat
  ),
  transports: [new transports.Console(options.console)],
  exitOnError: false,
})

export const loggerStream = {
  write (message, encoding) {
    (isProd ? morganLogger : simplestLogger).info(message)
  },
}
