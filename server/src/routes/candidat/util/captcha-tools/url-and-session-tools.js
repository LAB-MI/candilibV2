import { IS_CHECK_REF_DISABLE } from '../../../../config'
import { getSessionByCandidatId, pushSessionPathsVisistedById, upsertSession } from '../../../../models/session-candidat'
import { appLogger, getFrenchDateFromLuxon, getFrenchLuxon, getFrenchLuxonFromISO } from '../../../../util'

export const splitPatern = 'candilib/candidat/'
const HOME = 'home'
const SELECTION = 'selection'
const SELECTION_CENTRE = 'selection-centre'
const SELECTION_PLACE = 'selection-place'
const UNDEFINED_MONTH = 'undefinedMonth'
const UNDEFINED_DAY = 'undefinedDay'
const SELECTION_CONFIRMATION = 'selection-confirmation'

const PATERN_BASE_MONTH_DAY = `/${UNDEFINED_MONTH}/${UNDEFINED_DAY}`
const PATERN_BASE_CENTRE = `/${SELECTION}/${SELECTION_CENTRE}`
const PATERN_BASE_PLACE = `/${SELECTION}/${SELECTION_PLACE}`
// const PATERN_BASE_UNDEF_DAY = `/${UNDEFINED_DAY}${PATERN_BASE_PLACE}`
const PATERN_BASE_PLACE_MONTH_DAY = `${PATERN_BASE_MONTH_DAY}${PATERN_BASE_PLACE}`
const PATERN_BASE_CONFIRMATION = `/${SELECTION}/${SELECTION_CONFIRMATION}`

export const getRefPatern = ({
  geoDepartement,
  nomCentre,
  date,
}) => {
  const dateIso = getFrenchLuxonFromISO(date)
  const HUMAN_DATE = getFrenchDateFromLuxon(dateIso)
  const HUMAN_MONTH = dateIso.monthLong
  const humanMonthAndDay = `${HUMAN_MONTH}/${HUMAN_DATE}`

  const departementAnNomCentre = `${geoDepartement}/${nomCentre}`

  const PATERN_HOME = HOME
  const PATERN_CENTRE = `${geoDepartement}${PATERN_BASE_CENTRE}`
  const PATERN_PLACE = `${departementAnNomCentre}${PATERN_BASE_PLACE_MONTH_DAY}`
  // const PATERN_PLACE_MONTH = `${departementAnNomCentre}/${HUMAN_MONTH}${PATERN_BASE_UNDEF_DAY}`
  const PATERN_PLACE_MONTH_DAY = `${departementAnNomCentre}/${humanMonthAndDay}${PATERN_BASE_PLACE}`
  const PATERN_CONFIRMATION = `${departementAnNomCentre}/${humanMonthAndDay}/${date}${PATERN_BASE_CONFIRMATION}`

  return [
    PATERN_HOME,
    PATERN_CENTRE,
    PATERN_PLACE,
    // PATERN_PLACE_MONTH,
    PATERN_PLACE_MONTH_DAY,
    PATERN_CONFIRMATION,
  ]
}

export const isValidRef = async (req, loggerInfo) => {
  if (IS_CHECK_REF_DISABLE) return true
  const { userId, currentSession } = req

  const {
    nomCentre,
    geoDepartement,
    date,
  } = req.body

  const session = currentSession || (await getSessionByCandidatId({ userId }))
  console.log({ session })
  const refList = session?.pathsVisited || []
  if (!refList.length) {
    appLogger.warn({ ...loggerInfo, action: 'VALID_REF', description: 'No referrer' })
    return false
  }

  const expetedRefList = getRefPatern({
    geoDepartement,
    nomCentre,
    date,
  })

  const filteredRef = refList.filter(refItem =>
    expetedRefList.includes(refItem.split(splitPatern)[1]),
  )

  appLogger.info({ ...loggerInfo, action: 'VALID_REF', refList, filteredRef, expetedRefList, description: 'test' })
  return filteredRef.length === expetedRefList.length
}

// TODO: Rename next function
export const setCandidatIdSession = async (req) => {
  const { userId } = req
  const refererPath = decodeURI(req.get('referer'))

  const session = await getSessionByCandidatId({ userId })
  if (!session || !session?.pathsVisited) return false
  if (!session.pathsVisited.includes(refererPath)) {
    await pushSessionPathsVisistedById(
      userId,
      refererPath,
    )
  }
  return true
}
// TODO: Rename next function
export const setOrCreateCandidatIdSession = async (req) => {
  const { userId } = req
  const refererPath = decodeURI(req.get('referer'))
  const clientId = req.headers['x-client-id']
  const forwardedFor = req.headers['x-forwarded-for']
  const dateNow = getFrenchLuxon()
  const expires = dateNow.endOf('day').toISO()

  await upsertSession({
    userId,
    clientId,
    forwardedFor,
    hashCaptcha: '',
    session: {},
    expires,
    pathsVisited: [refererPath],
  })
}
