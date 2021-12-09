import { updateDisableAtDepartementById } from '../models/departement'
import { getFrenchLuxon, techLogger } from '../util'

export const disableDepartements = async (loggerInfo) => {
  const deps = [69, 38, 26]
  const disableAt = getFrenchLuxon(2022, 2, 1).toISO()
  const results = await Promise.all(deps.map(async (dep) => {
    const result = await updateDisableAtDepartementById(dep, disableAt)
    return {
      dep,
      nModified: result.nModified,
    }
  }))

  techLogger.info({ ...loggerInfo, action: 'DISABLE_DEPARTEMENTS', description: results })
}
