import { PARAMS_MISSING } from './message.constants'
import { appLogger } from '../../util'
import { sendMessageByContactUs } from './contact-us-business'

export const contactUs = async (req, res) => {
  const candidatId = req.userId
  const { candidat, subject, hasSignUp, message } = req.body

  const loggerInfo = {
    section: 'contact-us',
    candidatId,
  }
  try {
    const { codeNeph, nomNaissance, email, departement } = candidat || {}

    if (!candidatId && (!codeNeph || !nomNaissance || !email || !departement)) {
      const error = new Error(PARAMS_MISSING)
      error.status = 400
      loggerInfo.action = 'PARAMS_MISSING'
      throw error
    }

    loggerInfo.codeNeph = codeNeph
    loggerInfo.nomNaissance = nomNaissance
    loggerInfo.email = email
    loggerInfo.subject = subject

    loggerInfo.action = 'SEND_BY_CANDIDAT_NO_SIGNIN'

    if (candidatId) {
      loggerInfo.action = 'SEND_BY_SIGNIN_CANDIDAT'
    }

    const description = await sendMessageByContactUs(
      loggerInfo,
      candidatId,
      candidat,
      hasSignUp,
      subject,
      message,
    )

    appLogger.info({ ...loggerInfo, description })
    res.status(200).json({ success: true, message: description })
  } catch (error) {
    if (!error.status) {
      loggerInfo.action = 'ERROR_UNKNOWN'
    }
    appLogger.error({
      ...loggerInfo,
      description: error.message,
      error,
    })
    res.status(error.status || 500).json({
      success: false,
      message: error.message,
    })
  }
}
