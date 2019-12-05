// ***********************************************************
// This example support/index.js is processed and
// loaded automatically before your test files.
//
// This is a great place to put global configuration and
// behavior that modifies Cypress.
//
// You can change the location of this file or turn off
// automatically serving support files with the
// 'supportFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/configuration
// ***********************************************************

import './commands'
import { DateTime } from 'luxon'

const FRENCH_TIME_ZONE = 'Europe/Paris'

const now = DateTime.local().setLocale('fr').setZone(FRENCH_TIME_ZONE)
const date1 = now.plus({ months: 1 }).startOf('week')
const date2 = date1.plus({ weeks: 1 })

before(() => {
  // Initialise env variables for dates
  Cypress.env('dateDashboard', date1.toLocaleString({ month: 'short', day: '2-digit', year: 'numeric' }))
  Cypress.env('dateLong', date1.toLocaleString(DateTime.DATE_SHORT))
  Cypress.env('datePlace', date1.toFormat('dd/MM/yy'))
  Cypress.env('placeDate', date1.toFormat('yyyy-MM-dd'))

  Cypress.env('nextDate', date2.toLocaleString({ month: 'short', day: '2-digit', year: 'numeric' }))
  Cypress.env('dateLong2', date2.toLocaleString(DateTime.DATE_SHORT))
  Cypress.env('datePlace2', date2.toFormat('dd/MM/yy'))
  Cypress.env('placeDate2', date2.toFormat('yyyy-MM-dd'))

  Cypress.env('dateFail', now.toFormat('yyyy-MM-dd'))
  Cypress.env('dateFailLong', now.toLocaleString({ weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' }))
  Cypress.env('timeoutToRetry', now.plus({ days: 45 }).toLocaleString({ weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' }))

  if (!Cypress.env('build')) {
    Cypress.env('filePath', 'tests/e2e/filesLocal')
    cy.exec('cd ../server && npm run dev-setup')
  }
})
