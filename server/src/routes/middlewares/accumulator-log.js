import { logsTypeNameForDepartement, logsTypeNameForHomeDepartement, hoursOfSavedLogs } from '../../config'
import { saveManyLogActionsCandidat } from '../../models/logs-candidat/logs-queries'

import { getFrenchLuxon, techLogger } from '../../util'
import { candidatStatuses } from '../common/candidat-status-const'

function saveAccumulatorWithBulk () {
  const dateTimeNow = getFrenchLuxon()
  const datetimeNowToISO = dateTimeNow.toISO()
  const hourNow = dateTimeNow.hour
  if (hourNow !== accumulatorLog.lastSave && hoursOfSavedLogs.includes(hourNow)) {
    if (accumulatorLog.isSet) {
      const contentByDepartement = stringifyJson(accumulatorLog.getContentByDepartement())
      const contentByHomeDepartement = stringifyJson(accumulatorLog.getContentByHomeDepartement())
      const section = 'save-many-log-actions-candidat'

      saveManyLogActionsCandidat({
        type: logsTypeNameForDepartement,
        content: contentByDepartement,
        beginAt: accumulatorLog.beginAt,
        savedAt: datetimeNowToISO,
      }).then(({ savedAt }) => {
        techLogger.info({ section, description: `Logs by departement created at ${savedAt}` })
      })
        .catch((error) => {
          techLogger.error({ section, description: error.message, error })
        })

      saveManyLogActionsCandidat({
        type: logsTypeNameForHomeDepartement,
        content: contentByHomeDepartement,
        beginAt: accumulatorLog.beginAt,
        savedAt: datetimeNowToISO,
      }).then(({ savedAt }) => {
        techLogger.info({ section, description: `Logs by home departement created at ${savedAt}` })
      })
        .catch((error) => {
          techLogger.error({ section, description: error.message, error })
        })

      accumulatorLog.resetAccumulator()
      accumulatorLog.lastSave = hourNow
    }
    accumulatorLog.beginAt = datetimeNowToISO
  }
}

export function saveAccumulatorAsIntervalOf (intervalInMilscd) {
  accumulatorLog.intervalId = setInterval(saveAccumulatorWithBulk, intervalInMilscd)
}

const createShapedStatus = () => ({
  ...Array.from(Array(candidatStatuses.nbStatus), () => ({ logs: {} })),
})

const getHumanPathName = (method, isModification) => {
  if (method === 'DELETE') {
    return 'A'
  }
  if (method === 'PATCH' && !isModification) {
    return 'R'
  }
  if (method === 'PATCH' && isModification) {
    return 'M'
  }
}

export const accumulatorLog = {
  // timerIntervalSetting in msec
  beginAt: getFrenchLuxon().toISO(),
  timerIntervalSetting: 60000 * 1,
  intervalId: undefined,
  lastSave: undefined,
  bufferForDepartement: {},
  bufferForHomeDepartement: {},
  isSet: false,
  getContentByDepartement () {
    return this.bufferForDepartement
  },
  getContentByHomeDepartement () {
    return this.bufferForHomeDepartement
  },
  set (logRequest) {
    const {
      method,
      candidatStatus,
      departementBooked,
      candidatDepartement,
      isModification,
      candidatHomeDepartement,
    } = logRequest

    const requestString = getHumanPathName(method, isModification)
    const departementOfCandidat = departementBooked || candidatDepartement
    if (!this.bufferForDepartement[`${departementOfCandidat}`]) {
      this.bufferForDepartement[`${departementOfCandidat}`] = createShapedStatus()
    }

    const tmpLogValueForDepartement = this.bufferForDepartement[`${departementOfCandidat}`][`${candidatStatus}`].logs[requestString]

    this.bufferForDepartement[`${departementOfCandidat}`][`${candidatStatus}`].logs[requestString] =
      tmpLogValueForDepartement ? tmpLogValueForDepartement + 1 : 1

    if (!this.bufferForHomeDepartement[`${candidatHomeDepartement}`]) {
      this.bufferForHomeDepartement[`${candidatHomeDepartement}`] = createShapedStatus()
    }

    const tmpLogValueForHomeDepartement = this.bufferForHomeDepartement[`${candidatHomeDepartement}`][`${candidatStatus}`].logs[requestString]

    this.bufferForHomeDepartement[`${candidatHomeDepartement}`][`${candidatStatus}`].logs[requestString] =
      tmpLogValueForHomeDepartement ? tmpLogValueForHomeDepartement + 1 : 1

    this.isSet = true
  },

  resetAccumulator () {
    this.bufferForDepartement = {}
    this.bufferForHomeDepartement = {}
    this.isSet = false
  },
}

// TODO: Changé l'emplacement du lancement la fonction suivante
if (process.env.NODE_ENV !== 'test') {
  saveAccumulatorAsIntervalOf(accumulatorLog.timerIntervalSetting)
}

const stringifyJson = (value) => JSON.stringify(value)
const parseJson = (value) => JSON.parse(value)

export const setAccumulatorRequest = async (req, res, next) => {
  const {
    method,
    path,
    candidatStatus,
    body,
    candidatDepartement,
    candidatHomeDepartement,
  } = req

  const oldWrite = res.write
  const oldEnd = res.end
  const chunks = []

  res.write = (...restArgs) => {
    chunks.push(Buffer.from(restArgs[0]))
    oldWrite.apply(res, restArgs)
  }

  res.end = (...restArgs) => {
    if (restArgs[0]) {
      chunks.push(Buffer.from(restArgs[0]))
    }
    const resBody = Buffer.concat(chunks).toString('utf8')

    if ((method === 'PATCH' || method === 'DELETE') && path === '/places' && res.statusCode.toString() === '200') {
      accumulatorLog.set({
        method,
        candidatStatus,
        departementBooked: parseJson(resBody)?.reservation?.departement,
        candidatDepartement,
        isModification: body?.isModification,
        candidatHomeDepartement,
      })
    }

    oldEnd.apply(res, restArgs)
  }

  next()
}
