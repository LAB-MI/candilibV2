let withConsole
export const setWithConsole = value => {
  withConsole = value
}

const logger = {
  debug (msg) {
    if (withConsole) {
      console.debug(msg)
    }
  },
  info (msg) {
    if (withConsole) {
      console.info(msg)
    }
  },
  warn (msg) {
    if (withConsole) {
      console.warn(msg)
    }
  },
  error (msg) {
    if (withConsole) {
      console.error(msg)
    }
  },
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
