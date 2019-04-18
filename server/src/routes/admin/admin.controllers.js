import { findUserById } from '../../models/user'

export const getMe = async (req, res) => {
  const { email, departements } = await findUserById(req.userId)
  res.json({
    email,
    departements,
  })
}
