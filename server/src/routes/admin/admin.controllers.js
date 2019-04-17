import { findUserByEmail } from '../../models/user'

export const getMe = async (req, res) => {
  const { email, departements } = await findUserByEmail(req.user.email)
  res.json({
    email,
    departements,
  })
}
