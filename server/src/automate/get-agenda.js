/**
 * Configuration de l'ordonnanceur
 * @module get-agenda
 */

import Agenda from 'agenda'
import getConfig from './config.js'
import { techLogger } from '../util'

async function getAgenda (mongoose) {
  return new Promise((resolve, reject) => {
    const config = getConfig()

    const { agendaCollectionName } = config.db
    const { schedulerName, defaultConcurrency, defaultLockLifetime } = config.scheduler

    const agenda = new Agenda({
      name: schedulerName,
      defaultConcurrency: defaultConcurrency,
      defaultLockLifetime,
    })

    agenda.mongo(mongoose.connection, agendaCollectionName, (error, collection) => {
      if (error) {
        techLogger.error({
          section: 'automate',
          ACTION: 'CONNECT DB',
          description: error.message,
          error,
        })
        reject(error)
      }
      resolve(agenda)
    })
  })
}

export default getAgenda
