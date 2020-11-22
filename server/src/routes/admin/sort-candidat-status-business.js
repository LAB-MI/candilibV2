import { sortCandilibStatus } from '../../models/candidat'

export const sortStatus = async () => {
  const result = await sortCandilibStatus()
  return result
}
