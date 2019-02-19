import { compareToHash, createToken, logger } from '../../util'
import { findUserByEmail } from '../../models/user'

const badCredentialsBody = {
  success: false,
  message: 'Mauvaise combinaison email/mot de passe.',
}

export const getAdminToken = async (req, res) => {
  const { email, password } = req.body
  logger.info({
    label: 'admin-login',
    subject: email,
    action: 'TRIES_TO_LOG_IN',
  })

  try {
    const user = await findUserByEmail(email)
    if (!user) {
      logger.info({
        label: 'admin-login',
        action: 'FAILED_TO_FIND',
        complement: `${email} in DB`,
      })
      return res.status(401).send(badCredentialsBody)
    }

    let passwordIsValid = false

    if (password !== undefined) {
      passwordIsValid = compareToHash(password, user.password)
    }

    if (!passwordIsValid) {
      logger.info({
        label: 'admin-login',
        email,
        action: 'GAVE_WRONG_PASSWORD',
      })
      return res.status(401).send(badCredentialsBody)
    }

    const token = createToken(user.email, user.status)
    logger.info({
      label: 'admin-login',
      subject: email,
      action: 'LOGGED_IN',
      complement: 'ADMIN',
    })

    return res.status(201).send({ success: true, token })
  } catch (error) {
    logger.info({
      label: 'admin-login',
      subject: email,
      action: 'FAILED_TO_LOG_IN',
      complement: error,
    })
    return res.status(500).send({
      message: 'Erreur serveur',
      success: false,
    })
  }
}
