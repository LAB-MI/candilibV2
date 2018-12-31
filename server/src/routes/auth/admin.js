import express from 'express'
import jwt from 'jsonwebtoken'

import serverConfig from '../../config'
import { compareToHash } from '../../util/crypto'
import { findUserByEmail } from '../../models/user'

const router = express.Router()

router.post('/token', getToken)

export default router

const badCredentialsBody = {
  success: false,
  message: 'Mauvaise combinaison email/mot de passe.',
}

export async function getToken (req, res) {
  const { email, password } = req.body

  try {
    const user = await findUserByEmail(email)
    if (!user) {
      return res.status(401).send(badCredentialsBody)
    }

    let passwordIsValid = false

    if (password !== undefined) {
      passwordIsValid = compareToHash(password, user.password)
    }

    if (!passwordIsValid) {
      return res.status(401).send(badCredentialsBody)
    }

    const token = createToken(user.email, user.status)

    return res.status(201).send({ success: true, token })
  } catch (error) {
    return res.status(500).send({
      message: 'Erreur serveur',
      success: false,
    })
  }
}

function createToken (email, userStatus) {
  const token = jwt.sign(
    {
      email: email,
      level: serverConfig.USER_STATUS_LEVEL[userStatus] || 0,
    },
    serverConfig.secret,
    {
      expiresIn:
        serverConfig[`${userStatus}TokenExpiration`] === undefined
          ? '0'
          : serverConfig[`${userStatus}TokenExpiration`],
    }
  )

  return token
}
