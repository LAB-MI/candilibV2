import { compareToHash, createToken } from '../../util'
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
