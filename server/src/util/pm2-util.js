import pm2 from 'pm2'
import { EventEmitter } from 'events'
import { techLogger } from '.'

export const asyncGetPIDPM2 = () => new Promise((resolve, reject) => {
  pm2.describe('API', (err, processDescription) => {
    if (err) reject(err)
    resolve(processDescription[0]?.pid)
  })
})

const IPCMSG = 'candilib-api:msg'
let eventEmitter
let eventTypes

function getEventEmitter () {
  if (!eventEmitter) {
    eventEmitter = new EventEmitter()
  }
  return eventEmitter
}

const unsignedType = 'IPC:unsignedtype'
export const initBus = () => {
  addListener(unsignedType)
  pm2.launchBus(function (err, pm2Bus) {
    if (err) {
      techLogger.error({ section: 'INIT_BUS', pid: process.pid, err })
      return
    }
    pm2Bus.on(IPCMSG, function (packet) {
      // console.log({ packet, pid, receiveAt: Date() })
      const { data } = packet
      const { type } = data
      getEventEmitter().emit(eventTypes.includes(type) ? type : unsignedType, data)
    })
  })
}

export const sendMessageIPC = (type, message) => {
  process.send({
    type: IPCMSG,
    data: {
      type,
      message,
      sendByPid: process.pid,
      sendAt: Date(),
    },
  })
}

function HandlerFn (handler) {
  let isRunning = false
  let count = 0
  return function (data) {
    console.log('HandlerFn', process.pid, isRunning, handler, ++count)
    try {
      if (isRunning) {
        return
      }
      isRunning = true

      data.numero = count
      const asyncfn = new Promise((resolve) => resolve(handler(data)))
      asyncfn.finally(() => {
        isRunning = false
      })
      // if (typeof (handler) === 'function') {
      //   // if (!(handler.constructor instanceof Function)) {
      //   const result = handler(data)
      //   if (result instanceof Promise) {
      //     result.finally(() => {
      //       isRunning = false
      //     })
      //   } else {
      //     isRunning = false
      //   }
      //   return result
      // } else {
      //   const result = handler(data)
      //   isRunning = false
      //   return result
      // }
      // }
    } catch (error) {
      techLogger.error({ section: 'IPC', action: 'function handler', description: error.message, error })
      isRunning = false
    }
  }
}

export const addListener = (type, handler = consoleLogHandler) => {
  if (!eventTypes) {
    eventTypes = []
  }
  eventTypes.push(type)
  getEventEmitter().on(type, HandlerFn(handler))
}

const consoleLogHandler = function (data) {
  techLogger.warn({
    section: 'IPC',
    action: 'LOG',
    listener: 'consoleLogHandler',
    data,
  })
}
