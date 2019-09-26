/**
 * Gestion des loggers
 * @module util/logger
 */
import winston from 'winston'

const {
  createLogger, format, transports,
} = winston
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

/**
 * Transforme une erreur en objet avec les mêmes clés mais énumérables
 * @function
 *
 * @param {Error} error L'erreur à transformer
 *
 * @returns {Object} Objet avec toutes les clés énumérables
 */
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
 * Transforme un objet ou une chaîne message en objet affichable en JSON
 *
 * @param {string | Object} message
 *
 * @returns {Object} Objet avec toutes les clés importantes énumérables
 */
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
  return message
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

export const techLogger = createLogger({
  format: combine(
    label({ label: TECH_LABEL }),
    timestamp(),
    isProd ? logJsonFormat : logFormat,
  ),
  transports: [new transports.Console(options.console)],
  exitOnError: false,
})

export const appLogger = createLogger({
  format: combine(
    label({ label: APP_LABEL }),
    timestamp(),
    isProd ? logJsonFormat : logFormat,
  ),
  transports: [new transports.Console(options.console)],
  exitOnError: false,
})
