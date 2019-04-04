import mongoose from 'mongoose'

import { candidatFields } from '../candidat/candidat.model'

const { Schema } = mongoose

const ArchivedCandidatFields = {
  ...candidatFields,
  archivedAt: {
    type: Date,
    default: undefined,
  },
  archiveReason: {
    type: String,
    default: undefined,
  },
}
ArchivedCandidatFields.email.unique = undefined
const ArchivedCandidatSchema = new Schema(ArchivedCandidatFields)

ArchivedCandidatSchema.index(
  {
    codeNeph: 'text',
    nomNaissance: 'text',
  },
  {
    name: 'NephNom',
  }
)

ArchivedCandidatSchema.pre('save', async function preSave () {
  const archivedCandidat = this
  if (!archivedCandidat.archivedAt) {
    archivedCandidat.archivedAt = new Date()
  }
})

export default mongoose.model('ArchivedCandidat', ArchivedCandidatSchema)
