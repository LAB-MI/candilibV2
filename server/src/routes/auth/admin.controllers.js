import { compareToHash, createToken, appLogger } from '../../util'
import { findUserByEmail } from '../../models/user'

const badCredentialsBody = {
  success: false,
  message: 'Mauvaise combinaison email/mot de passe.',
}

export const getAdminToken = async (req, res) => {
  const { email, password } = req.body

  try {
    const user = await findUserByEmail(email)
    if (!user) {
      appLogger.info({
        section: 'admin-login',
        subject: email,
        action: 'FAILED_TO_FIND_USER_BY_EMAIL',
        complement: `${email} not in DB`,
      })
      return res.status(401).send(badCredentialsBody)
    }

    let passwordIsValid = false

    if (password !== undefined) {
      passwordIsValid = compareToHash(password, user.password)
    }

    if (!passwordIsValid) {
      appLogger.info({
        section: 'admin-login',
        subject: email,
        action: 'USER_GAVE_WRONG_PASSWORD',
      })
      return res.status(401).send(badCredentialsBody)
    }

    const token = createToken(user.email, user.status)
    appLogger.info({
      section: 'admin-login',
      subject: email,
      action: 'LOGGED_IN',
      complement: user.status,
    })

    return res.status(201).send({ success: true, token })
  } catch (error) {
    appLogger.info({
      section: 'admin-login',
      subject: email,
      action: 'FAILED_TO_LOG_IN',
      complement: error,
    })
    return res.status(500).send({
      message: `Erreur serveur : ${error.message}`,
      success: false,
    })
  }
}
