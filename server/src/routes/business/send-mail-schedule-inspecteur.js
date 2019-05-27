import { appLogger } from '../../util'
import { getSheduleInspecteurTemplate } from './mail/body-schedule-inspecteur-template'
import { getHtmlBody } from './mail'
import { dateTimeToFormatFr } from '../../util/date.util'
import { sendMail } from './send-mail'
import { findInspecteurById } from '../../models/inspecteur'
import { findCentreById } from '../../models/centre'
import { findCandidatById } from '../../models/candidat'
import { getFailedSheduleInspecteurTemplate } from './mail/failed-mail-schelude-inspecteurs-template'

const getScheduleInspecteurBody = async (
  inspecteurName,
  inspecteurMatricule,
  date,
  centre,
  departement,
  places
) => {
  const action = 'get-body-shechule-inspecteur'
  appLogger.debug({ func: 'getScheduleInspecteurBody', action, places })

  if (!places || places.length === 0) {
    throw new Error('NO_PLACES')
  }

  const planning = {
    '08:00': {},
    '08:30': {},
    '09:00': {},
    '09:30': {},
    '10:00': {},
    '10:30': {},
    '11:00': {},
    '11:30': {},
    '13:30': {},
    '14:00': {},
    '14:30': {},
    '15:00': {},
    '15:30': {},
  }
  await Promise.all(
    places.map(async place => {
      const { candidat, date } = place
      const heure = dateTimeToFormatFr(date).hour
      let candidatObject
      if (candidat) {
        candidatObject = await findCandidatById(candidat)
        if (!candidatObject) {
          throw new Error('CANDIDAT_NOT_FOUND')
        }
      }
      const neph = (candidatObject && candidatObject.codeNeph) || ''
      const nom = (candidatObject && candidatObject.nomNaissance) || ''
      const prenom = (candidatObject && candidatObject.prenom) || ''

      planning[heure] = {
        neph,
        nom,
        prenom,
      }
      return planning[heure]
    })
  )

  const body = getSheduleInspecteurTemplate(
    inspecteurName,
    inspecteurMatricule,
    date,
    centre,
    departement,
    planning
  )

  return getHtmlBody(body)
}

export const sendScheduleInspecteur = async (email, places) => {
  appLogger.debug({
    func: 'sendScheduleInspecteur',
    args: { email, places },
  })
  const action = 'SEND_SHEDULE_INSPECTEUR'

  if (!email || !places || places.length <= 0) {
    const messageError =
      "l'adresse email ou la liste des créneaux sont manquantes "
    appLogger.error({ action, messageError })
    throw new Error(messageError)
  }
  const { inspecteur, date, centre } = places[0]

  const inspectObject = await findInspecteurById(inspecteur)
  if (!inspectObject) {
    throw new Error('INSPECTEUR_NOT_FOUND')
  }
  const inspecteurName = inspectObject.nom
  const inspecteurMatricule = inspectObject.matricule
  const dateToString = dateTimeToFormatFr(date).date

  const centreObject = await findCentreById(centre)
  if (!centreObject) {
    throw new Error('CENTRE_NOT_FOUND')
  }
  const centreNom = centreObject.nom
  const departement = centreObject.departement

  const content = await getScheduleInspecteurBody(
    inspecteurName,
    inspecteurMatricule,
    dateToString,
    centreNom,
    departement,
    places
  )
  const subject = `Bordereau de l'inspecteur ${inspecteurName}/${inspecteurMatricule} pour le ${dateToString} au centre de ${centreNom} du département ${departement}`

  // appLogger.debug({ func: 'sendFailureExam', content, subject })

  return sendMail(email, { content, subject })
}

export const sendMailForScheduleInspecteurFailed = async (
  email,
  date,
  departement,
  inspecteurs
) => {
  appLogger.debug({
    func: 'sendMailForScheduleInspecteurFailed',
    args: { email, date, departement, inspecteurs },
  })

  const dateToString = dateTimeToFormatFr(date).date

  const content = getFailedSheduleInspecteurTemplate(
    dateToString,
    inspecteurs.map(inspecteur => inspecteur.nom + '/' + inspecteur.matricule)
  )
  const subject = `Echec d'envoi de mail pour le planning du ${date} du département ${departement}`
  return sendMail(email, { content, subject })
}
