/**
 * Ensemble des actions sur les logs actions candidat la base de données
 * @module module:models/place/place-queries
 */
// import mongoose from 'mongoose'

import { getFrenchLuxon } from '../../util'
import LogActionsCandidat from './log-actions-candidat-model'
// import { techLogger } from '../../util'
// import { queryPopulate } from '../util/populate-tools'

// export const PLACE_ALREADY_IN_DB_ERROR = 'PLACE_ALREADY_IN_DB_ERROR'

// const arr = [{ name: 'Star Wars' }, { name: 'The Empire Strikes Back' }];
// Movies.insertMany(arr, function(error, docs) {});

export const saveManyLogActionsCandidat = async logActionsCandidatList => {
  // await LogActionsCandidat.insertMany(logActionsCandidatList, function(error, docs) {})
  const result = await LogActionsCandidat.insertMany(logActionsCandidatList)
  return result
}

export const getLogsByFilter = async (filters) => {
  const { /* method, path, */ start, end, groupCandidatBy, pageNumber } = filters
  const method = 'GET'
  const path = '/places'
  const limit = 10000
  // Partie Controlller
  const defaultHours = { hours: 2 }
  const dateNowLuxon = getFrenchLuxon()
  const shapedFilter = {
    requestedAt: { $gte: start, $lte: end },
  }

  if (groupCandidatBy) {
    console.log({ groupCandidatBy })
  }

  if (!start) { shapedFilter.requestedAt.$gte = dateNowLuxon.minus(defaultHours).toJSDate() }
  if (!end) { shapedFilter.requestedAt.$lte = dateNowLuxon.toJSDate() }
  if (method) { shapedFilter.method = method }
  if (path) { shapedFilter.path = path }

  const filteredLogs = await LogActionsCandidat.find(
    {
      ...shapedFilter,
    },
  )
    .skip(pageNumber > 0 ? ((pageNumber - 1) * limit) : 0)
    .limit(limit)
    // .sort({ requestedAt: 1 })
    // .distinct('candidat')
    // .forEach()
  // console.log({ filteredLogs })
  // filteredLogs.reduce((accu, current) => {
  //   console.log({ current })
  //   if (!accu[`${current.candidat}`]) {
  //     accu[`${current.candidat}`] = []
  //   }
  //   accu[`${current.candidat}`].push(current)
  //   return accu
  // }, {})
  return filteredLogs
}

// partie Businness

// path: nom de la route emprinté par le candidat
// method: le method de requete souhaité, si pas specfier prent tout
// start: DateTime du debut de période souhaité par default date now moin 5h
// end: DateTime de fin de période souhaité par default date now plus 5h
// candidat: {
//   les booker
//   les pas booker et bookable
//   les pas booker et bookable mais qui ne se son pas connecté
// }
// await LogActionsCandidat.insertMany(logActionsCandidatList, function(error, docs) {})
// const result = await LogActionsCandidat.insertMany(logActionsCandidatList)
// return result
// requestedAt: {
//   '$gte': '2020-11-09T09:00:52.639+01:00',
//   '$lte': '2020-11-09T21:00:52.639+01:00'
// }

// 'requestedAt': {
//   '$gte': '2020-11-09T08:06:04.621Z',
//   '$lte': '2020-11-09T20:06:04.621Z'
// }
