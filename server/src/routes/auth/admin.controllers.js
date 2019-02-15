import { compareToHash, createToken } from '../../util'
import { findUserByEmail } from '../../models/user'
import { addLog } from '../../msg-broker-setup'

const badCredentialsBody = {
  success: false,
  message: 'Mauvaise combinaison email/mot de passe.',
}

export const getAdminToken = async (req, res) => {
  const { email, password } = req.body
  addLog(`${email} is trying to connect`)

  try {
    const user = await findUserByEmail(email)

    if (!user) {
      addLog(`${email} is not registered`)
      return res.status(401).send(badCredentialsBody)
    }
    addLog(`${email} is registered`)

    let passwordIsValid = false

    if (password !== undefined) {
      passwordIsValid = compareToHash(password, user.password)
    }

    if (!passwordIsValid) {
      addLog(`${email} gave a wrong password`)
      return res.status(401).send(badCredentialsBody)
    }

    addLog(`${email} is now connected`)
    const token = createToken(user.email, user.status)

    return res.status(201).send({ success: true, token })
  } catch (error) {
    addLog(`${email} could not be connected because of ${error.message}`)
    return res.status(500).send({
      message: 'Erreur serveur',
      success: false,
    })
  }
}
