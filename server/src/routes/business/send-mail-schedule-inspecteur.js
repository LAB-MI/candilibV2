import { appLogger } from '../../util'
import { getSheduleInspecteurTemplate } from './mail/body-schedule-inspecteur-template'
import { getHtmlBody } from './mail'
import { dateTimeToFormatFr } from '../../util/date.util'
import { sendMail } from './send-mail'
import { findInspecteurById } from '../../models/inspecteur'
import { findCandidatById } from '../../models/candidat'

const getScheduleInspecteurBody = async (
  inspecteur,
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
    places.array.map(async place => {
      const { candidat, date } = place
      const heure = dateTimeToFormatFr(date).hour
      let candidatObject
      if (candidat) {
        if (candidat._id) {
          candidatObject = candidat
        } else {
          candidatObject = await findCandidatById(candidat)
        }
      }
      const neph = (candidatObject && candidatObject.codeNeph) || ''
      const nom = (candidatObject && candidatObject.nom) || ''
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
    inspecteur,
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

  let inspectObject
  if (inspecteur._id) {
    inspectObject = inspecteur
  } else {
    inspectObject = await findInspecteurById(inspecteur)
  }
  const inspecteurNom = inspectObject.nom

  const dateToString = dateTimeToFormatFr(date).date

  let centreObject
  if (centre._id) {
    centreObject = centre
  } else {
    centreObject = await findInspecteurById(centre)
  }
  const centreNom = centreObject.nom
  const departement = centreObject.departement

  const content = await getScheduleInspecteurBody(
    inspecteurNom,
    dateToString,
    centreNom,
    departement,
    places
  )
  const subject = `Bordereau de l'inspecteur ${inspecteurNom} pour le ${dateToString} au centre de ${centreNom} du département ${departement}`

  appLogger.debug({ func: 'sendFailureExam', content, subject })

  return sendMail(email, { content, subject })
}

export const sendMailForScheduleInspecteurFailed = async (
  email,
  date,
  departement,
  inspecteurs
) => {
  const dateToString = dateTimeToFormatFr(date).date

  const content = getSheduleInspecteurTemplate(
    dateToString,
    inspecteurs.map(inspecteur => inspecteur.nom + '/' + inspecteur.matricule)
  )
  const subject = `Echec d'envoi de mail pour le planning du ${date} du département ${departement}`
  return sendMail(email, { content, subject })
}
