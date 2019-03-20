const logger = {
  debug (msg) {},
  info (msg) {
    console.info(msg)
  },
  warn (msg) {
    console.warn(msg)
  },
  error (msg) {
    console.error(msg)
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
