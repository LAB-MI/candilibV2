import { parseAsync } from 'json2csv'

import { appLogger, getFrenchLuxonFromISO } from '../../util'
import { getResultsExamAllDpt } from './statistics.business'

const fields = [
  {
    label: 'Date',
    value: 'date',
  },
  {
    label: 'Departement',
    value: 'departement',
  },
  {
    label: 'Invités',
    value: 'invited',
  },
  {
    label: 'Inscrits',
    value: 'registered',
  },
  {
    label: 'Validés',
    value: 'checked',
  },
  {
    label: 'En attente',
    value: 'waiting',
  },
  {
    label: 'Non examinés',
    value: 'notExamined',
  },
  {
    label: 'Absents',
    value: 'absent',
  },
  {
    label: 'Reçus',
    value: 'received',
  },
  {
    label: 'Echecs',
    value: 'failed',
  },
]

const options = { fields, delimiter: ';', quote: '' }
const parseStats = statsData => parseAsync(statsData, options)

export const getStats = async (req, res) => {
  const { beginPeriode, endPeriode, isCsv } = req.query
  // TODO: Use beginPeriode and endPeriode because it is actualy unused

  const loggerContent = {
    section: 'admin-getStats',
    admin: req.userId,
    beginPeriode,
    endPeriode,
    isCsv,
  }

  try {
    // TODO: Use begin and end because it is actualy unused
    const begin = getFrenchLuxonFromISO(beginPeriode)
      .startOf('day')
      .toJSDate()
    const end = getFrenchLuxonFromISO(endPeriode)
      .endOf('day')
      .toJSDate()

    const statsKpi = await getResultsExamAllDpt(begin, end)
    if (isCsv === 'true') {
      const statsKpiCsv = await parseStats(statsKpi)
      const filename = 'statsCandidats.csv'
      appLogger.info({
        ...loggerContent,
        action: 'GET STATS KPI CSV',
        statsKpi,
      })
      return res
        .status(200)
        .attachment(filename)
        .send(statsKpiCsv)
    }

    appLogger.info({
      ...loggerContent,
      action: 'GET STATS KPI',
      statsKpi,
    })

    return res
      .status(200)
      .json({ success: true, message: 'stats OK', statsKpi })
  } catch (error) {
    appLogger.error({
      ...loggerContent,
      action: 'ERROR GET STATS KPI',
      description: error.message,
      error,
    })
    res.status(500).send({ success: false, message: error.message })
  }
}
