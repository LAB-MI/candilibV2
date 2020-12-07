import { getFrenchLuxon } from '../../util'
import ArchivedCandidatStatus from './archived-candidat-status-model'

export const createArchivedCandidatStatus = async archiveddata => {
  const candidatStatusData = await ArchivedCandidatStatus.create(archiveddata)
  return candidatStatusData
}

export const findArchivedCandidatStatus = async (status, begin, end, candidatIds) => {
  const filters = {}

  if (begin) {
    filters.createdAt.$gte = begin
  }
  if (end) {
    filters.lastSavedAt.$lte = end
  }
  if (status) {
    filters.status = status
  }
  if (candidatIds && candidatIds instanceof Array) {
    filters.candidatId = { $in: candidatIds }
  }

  const candidat = await ArchivedCandidatStatus.find(filters)
  return candidat
}

export const createManyArchivedCandidatStatus = async (status, candidatIds) => {
  const documents = candidatIds.map(candidatId => ({
    insertOne: {
      document: {
        status,
        candidatId,
      },
    },
  }))

  const result = await ArchivedCandidatStatus.bulkWrite(documents)
  return result
}

export const updateArchivedCandidatStatus = async (status, candidatIds, lastSavedAt) => {
  const result = await ArchivedCandidatStatus.updateMany({
    status, candidatId: { $in: candidatIds }, isArchived: false,
  }, {
    lastSavedAt,
  })
  return result
}
export const setIsArchivedCandidatStatus = async (status, candidatIds, lastSavedAt) => {
  const result = await ArchivedCandidatStatus.updateMany({
    status: { $ne: status }, candidatId: { $in: candidatIds }, isArchived: false,
  }, {
    lastSavedAt,
    isArchived: true,
  })
  return result
}

export const addArchivedCandidatStatus = async (status, candidatIds) => {
  const lastSavedAt = getFrenchLuxon().toJSDate()
  const ops = candidatIds.reduce((acc, { candidatId, hasModified }) => {
    acc.push({
      updateOne: {
        filter: {
          status,
          candidatId,
          isArchived: false,
        },
        update: {
          lastSavedAt,
        },
        upsert: true,
      },
    })
    if (hasModified) {
      acc.push({
        updateOne: {
          filter: {
            status: { $ne: status },
            candidatId,
            isArchived: false,
          },
          update: {
            lastSavedAt,
            isArchived: true,
          },
        },
      })
    }
    return acc
  }, [])

  const result = await ArchivedCandidatStatus.bulkWrite(ops)
  return result
}
