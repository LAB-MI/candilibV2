import { sortStatus } from './sort-candidat-status-business'

// TODO: JSDOC
export const sortStatusCandilib = async (req, res) => {
  try {
    await sortStatus()
    console.log('OKOKOK!!')
    res.status(200)
  } catch (error) {
    console.log({ error })
    res.status(400)
  }
}
