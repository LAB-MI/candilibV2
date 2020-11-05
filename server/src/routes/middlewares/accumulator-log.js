import { saveManyLogActionsCandidat } from '../../models/log-actions-candidat'
import { techLogger } from '../../util'

function saveAccumulatorWithBulk () {
  const accuClone = accumulatorLog.get().slice()
  accumulatorLog.resetAccumulator()

  // saveManyLogActionsCandidat(accuClone).catch((error) => {
  //   techLogger.error({ error })
  // })

  // console.log(
  //     `--SAVE_OK_ON_PROCESS[${process.pid}]
  //     _SIZE_ACCUMULATOR[${accuClone.length}]--`,
  // )
  if (accuClone.length) {
    saveManyLogActionsCandidat(accuClone).catch((error) => {
      techLogger.error({ error })
    })
  }
}

export function saveAccumulatorAsIntervalOf (intervalInMilscd) {
  accumulatorLog.intervalId = setInterval(saveAccumulatorWithBulk, intervalInMilscd)
}

export const accumulatorLog = {
  // timerIntervalSetting in msec
  timerIntervalSetting: 10000,
  intervalId: undefined,
  buffer: [],
  // bufferRealTime: {},
  errors: [],
  get () {
    return this.buffer
  },
  set (logRequest) {
    // if (!this.bufferRealTime[`${logRequest.candidat}`]) {
    //   this.bufferRealTime[`${logRequest.candidat}`] = {
    //     logs: {},
    //   }
    // }
    this.buffer.push(logRequest)
    // console.log(`[ ${this.buffer.length} ]`)
    // if (this.buffer.length > 50000) {
    //   saveAccumulatorWithBulk()
    // }
    // console.log({ buffer: this.buffer })
  },

  resetAccumulator () {
    this.buffer = []
    // this.bufferRealTime = {}
  },
}

// TODO: Changé l'emplacement du lancement la fonction suivante
// 1min
// const timerSetting = 60000 * 1

saveAccumulatorAsIntervalOf(accumulatorLog.timerIntervalSetting)

const strigifyQuerry = (query) => JSON.stringify(query)
const strigifyParams = (params) => JSON.stringify(params)

export const setAccumulatorRequest = async (req, res, next) => {
  const {
    method,
    params,
    query,
    path,
    userId,
    headers,
  } = req

  res.on('finish', () => {
    console.log({
      method,
      path,
      query: strigifyQuerry(query),
      params: strigifyParams(params),
    })
    accumulatorLog.set({
      method,
      path,
      query: strigifyQuerry(query),
      params: strigifyParams(params),
      userAgent: headers['user-agent'],
      requestedAt: new Date().toJSON(),
      status: res.statusCode.toString(),
      candidat: userId,
    })
  })
  next()
}
