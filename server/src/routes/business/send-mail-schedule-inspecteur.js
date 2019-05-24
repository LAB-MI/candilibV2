import { appLogger } from '../../util'
import { getSheduleInspecteurTemplate } from './mail/body-schedule-inspecteur-template'
import { getHtmlBody } from './mail'
import { dateTimeToFormatFr } from '../../util/date.util'
import { sendMail } from './send-mail'

const getScheduleInspecteurBody = (
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
  places.array.forEach(place => {
    const { candidat, date } = place
    const heure = dateTimeToFormatFr(date).hour
    const neph = (candidat && candidat.codeNeph) || ''
    const nom = (candidat && candidat.nom) || ''
    const prenom = (candidat && candidat.prenom) || ''

    planning[heure] = {
      neph,
      nom,
      prenom,
    }
  })

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
  const inspecteur = places[0].inspecteur.nom
  const date = dateTimeToFormatFr(places[0].date).date
  const centre = places[0].centre.nom
  const departement = places[0].centre.departement

  const content = await getScheduleInspecteurBody(
    inspecteur,
    date,
    centre,
    departement,
    places
  )
  const subject = `Bordereau de l'inspecteur ${inspecteur} pour le ${date} au centre de ${centre} du département ${departement}`

  appLogger.debug({ func: 'sendFailureExam', content, subject })

  return sendMail(email, { content, subject })
}
