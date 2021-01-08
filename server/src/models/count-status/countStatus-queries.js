import CountStatus from './countStatus-model'
import { countStatusValidator } from '../../util/validators/countStatus-validator'

export const createCountStatus = async (departement, candidatStatus, count, createdAt) => {
  const validated = await countStatusValidator.validateAsync({
    departement, candidatStatus, count,
  })

  if (validated.error) throw new Error(validated.error)

  const valuesStatus = { departement, candidatStatus, count }
  if (process.env.NODE_ENV === 'test') {
    if (createdAt) {
      valuesStatus.createdAt = createdAt
    }
  }
  const status = new CountStatus(valuesStatus)
  await status.save()

  return status
}

export const findCountStatus = async (begin, end, departement) => {
  const filters = {}

  if (departement) filters.departement = departement

  if (begin || end) {
    filters.createdAt = {}
    if (begin) filters.createdAt.$gte = begin
    if (end) filters.createdAt.$lte = end
  }

  const countStatus = await CountStatus.find(filters).sort('createdAt')
  return countStatus
}

export const createManyCountStatus = async (countStatuses) => {
  // TODO: Add validator for array countStatus
  const result = await CountStatus.insertMany(countStatuses)
  return result
}
