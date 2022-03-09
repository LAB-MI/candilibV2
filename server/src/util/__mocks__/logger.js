let withConsole
export const setWithConsole = value => {
  withConsole = value
}

const logger = {
  debug (msg) {
    if (withConsole && (typeof withConsole === 'boolean' || withConsole === 'debug')) {
      console.debug(msg)
    }
  },
  info (msg) {
    if (withConsole && (typeof withConsole === 'boolean' || withConsole === 'info')) {
      console.info(msg)
    }
  },
  warn (msg) {
    if (withConsole && (typeof withConsole === 'boolean' || withConsole === 'warn')) {
      console.warn(msg)
    }
  },
  error (msg) {
    if (withConsole && (typeof withConsole === 'boolean' || withConsole === 'error')) {
      console.error(msg)
    }
  },
}

export function jsonFormat (tokens, req, res) {
  return JSON.stringify({
    api: {
      time_local: tokens.date(req, res, 'iso'),
      method: tokens.method(req, res),
      uri: tokens.url(req, res),
      status: +tokens.status(req, res),
      response_time: +tokens['response-time'](req, res),
    },
  })
}
export const simpleLogger = logger
export const simplestLogger = logger

export const techLogger = logger

export const appLogger = logger

export const loggerStream = {
  write (message, encoding) {
    simplestLogger.info(message)
  },
}
