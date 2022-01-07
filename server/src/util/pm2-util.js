import pm2 from 'pm2'
import { EventEmitter } from 'events'
import { techLogger } from '.'

const loggerInfo = {
  section: 'PM2 Module',
}
export const asyncGetPIDPM2 = () => new Promise((resolve, reject) => {
  pm2.describe('API', (err, processDescription) => {
    if (err) reject(err)
    resolve(processDescription[0]?.pid)
  })
})

export const IPCMSG = 'process:msg'// 'candilib-api:msg'

const eventTypes = []
const eventEmitter = new EventEmitter()

const unsignedType = 'IPC:unsignedtype'
export const initBus = (done) => {
  addListener(unsignedType)
  pm2.launchBus(function (err, pm2Bus) {
    if (err) {
      techLogger.error({ section: 'INIT_BUS', pid: process.pid, err })
      return
    }
    // console.log({ err, pm2Bus })
    pm2Bus.on(IPCMSG, function (packet) {
      // console.log({ packet, pid: process.pid, receiveAt: Date() })
      const { data } = packet
      const { type } = data
      eventEmitter.emit(eventTypes.includes(type) ? type : unsignedType, data)
    })

    techLogger.info({
      ...loggerInfo,
      action: 'INTTBUS',
      description: 'pm2 bus lancé',
      IPCMSG,
      pid: process.pid,
    })

    done && done()
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

export const addListener = (type, handler = consoleLogHandler) => {
  eventTypes.push(type)
  eventEmitter.on(type, handler)
  techLogger.info({ ...loggerInfo, action: 'ADD_LISTENER', pid: process.pid, description: `listener ajouté sur ${type}` })
}

const consoleLogHandler = function (data) {
  techLogger.warn({
    listener: 'consoleLogHandler',
    data,
  })
}
