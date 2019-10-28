import { parseAsync } from 'json2csv'

import { appLogger } from '../../util'
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
  const loggerContent = {
    section: 'admin-getStats',
    admin: req.userId,
  }

  try {
    const statsKpi = await getResultsExamAllDpt()
    const statsKpiCsv = await parseStats(statsKpi)
    const filename = 'statsCandidats.csv'
    appLogger.info({
      ...loggerContent,
      action: 'GET STATS KPI',
      statsKpi,
    })
    res
      .status(200)
      .attachment(filename)
      .send(statsKpiCsv)
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
