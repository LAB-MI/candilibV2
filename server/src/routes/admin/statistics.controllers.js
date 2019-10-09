import { parseAsync } from 'json2csv'

import { appLogger, getFrenchLuxon, getFrenchLuxonFromISO } from '../../util'
import {
  getResultsExamAllDpt,
  getAllPlacesProposeInFutureByDpt,
} from './statistics.business'

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
  const { beginPeriode, endPeriode, isCsv, isPlacesExam } = req.query

  const loggerContent = {
    section: 'admin-getStats',
    admin: req.userId,
    beginPeriode,
    endPeriode,
    isCsv,
  }

  try {
    if (isPlacesExam === 'true') {
      const beginDate = getFrenchLuxon()
        .startOf('day')
        .toJSDate()
      const statsKpi = await getAllPlacesProposeInFutureByDpt(beginDate)

      if (isCsv === 'true') {
        appLogger.info({
          ...loggerContent,
          action: 'GET STATS KPI CSV PROPOSE IN FUTURE',
          statsKpi,
        })

        const statsKpiCsv = await parseStats(statsKpi)
        const filename = 'statsPlacesExam.csv'

        return res
          .status(200)
          .attachment(filename)
          .send(statsKpiCsv)
      }

      appLogger.info({
        ...loggerContent,
        action: 'GET STATS KPI PROPOSE IN FUTURE',
        statsKpi,
      })

      return res
        .status(200)
        .json({ success: true, message: 'stats OK', statsKpi })
    }

    const begin = getFrenchLuxonFromISO(beginPeriode)
      .startOf('day')
      .toJSDate()
    const end = getFrenchLuxonFromISO(endPeriode)
      .endOf('day')
      .toJSDate()

    const statsKpi = await getResultsExamAllDpt(begin, end)

    if (isCsv === 'true' && isPlacesExam !== 'true') {
      const statsKpiCsv = await parseStats(statsKpi)
      const filename = 'statsCandidats.csv'

      appLogger.info({
        ...loggerContent,
        action: 'GET STATS KPI CSV',
        description: `Calcul de stats des départements: ${statsKpi.map(
          el => el.departement
        )}`,
      })
      return res
        .status(200)
        .attachment(filename)
        .send(statsKpiCsv)
    }

    appLogger.info({
      ...loggerContent,
      action: 'GET STATS KPI',
      description: `Calcul de stats des departements: ${statsKpi.map(
        el => el.departement
      )}`,
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
