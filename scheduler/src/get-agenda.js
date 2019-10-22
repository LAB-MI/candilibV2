/**
 * Configuration de l'ordonnanceur
 * @module
 */

import Agenda from 'agenda'
import getConfig from './config.js'

function getAgenda () {
  const config = getConfig()

  const { dbUser, dbPass, dbName, mongoUrl, agendaCollectionName } = config.db
  const { schedulerName, defaultConcurrency } = config.scheduler

  const mongoConnectionString = mongoUrl || `mongodb://${dbUser}:${dbPass}@localhost:27017/${dbName}`

  const agenda = new Agenda({
    db: { address: mongoConnectionString, collection: agendaCollectionName },
    name: schedulerName,
    defaultConcurrency: defaultConcurrency,
  })

  return agenda
}

export default getAgenda
