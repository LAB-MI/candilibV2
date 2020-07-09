import { createLogger, format, transports } from 'winston'
import { getFrenchLuxonFromISO } from './date-util'
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

export const getProperObjectFromError = error => {
  if (error == null) {
    return '<empty error>'
  }
  return Object.getOwnPropertyNames(error).reduce(
    (acc, key) => ({
      ...acc,
      [key]: error[key],
    }),
    Object.create(null),
  )
}

/**
 * Encapsule les valeurs des clés begin, end, date et dateTime par un '[]' pour que fluend-elastic ne les convertive pas en date
 * @param {Object} message - Message structuré
 */
export const getProperObjectFromDate = message => {
  return Object.getOwnPropertyNames(message).reduce((acc, key) => {
    let value = message[key]
    if (['begin', 'end', 'date', 'dateTime'].includes(key)) {
      const newkey = key + 'Str'
      acc = {
        ...acc,
        [newkey]: `__${value}__`,
      }
      const datetimevalue = getFrenchLuxonFromISO(value)
      if (datetimevalue.isValid) {
        value = datetimevalue.toISO()
        acc[key] = value
      }
      return acc
    }
    return {
      ...acc,
      [key]: value,
    }
  }, Object.create(null))
}

export const getProperObject = message => {
  if (message == null) {
    return { default: '<empty message>' }
  }
  if (typeof message === 'string') {
    return { default: message }
  }
  if (message instanceof Error) {
    return getProperObjectFromError(message)
  }
  if ('error' in message) {
    message.error = getProperObjectFromError(message.error)
  }
  return getProperObjectFromDate(message)
}

const logJsonFormat = printf(({ label, level, message, timestamp }) => {
  const content = getProperObject(message)
  return JSON.stringify({
    content,
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

export function jsonFormat (tokens, req, res) {
  return JSON.stringify({
    api: {
      time_local: tokens.date(req, res, 'iso'),
      method: tokens.method(req, res),
      request_uri: tokens.url(req, res),
      uri: tokens.url(req, res),
      status: +tokens.status(req, res),
      content_length: +tokens.res(req, res, 'content-length'),
      http_referrer: tokens.referrer(req, res),
      http_version: tokens['http-version'](req, res),
      remote_addr: tokens['remote-addr'](req, res),
      remote_user: tokens['remote-user'](req, res),
      http_user_agent: tokens['user-agent'](req, res),
      response_time: +tokens['response-time'](req, res),
    },
  })
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
    isTest ? logFormat : logJsonFormat,
  ),
  transports: [new transports.Console(options.console)],
  exitOnError: false,
})

export const morganLogger = createLogger({
  format: combine(label({ label: TECH_LABEL }), timestamp(), simplestFormat),
  transports: [new transports.Console(options.console)],
  exitOnError: false,
})

export const appLogger = createLogger({
  format: combine(
    label({ label: APP_LABEL }),
    timestamp(),
    isTest ? logFormat : logJsonFormat,
  ),
  transports: [new transports.Console(options.console)],
  exitOnError: false,
})

export const loggerStream = {
  write (message, encoding) {
    const logger = isProd ? morganLogger : simplestLogger
    logger.info(message)
  },
}
