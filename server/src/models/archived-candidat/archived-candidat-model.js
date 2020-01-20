import mongoose from 'mongoose'

import { candidatFields } from '../candidat/candidat-model'

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

ArchivedCandidatFields.email = { ...ArchivedCandidatFields.email }
ArchivedCandidatFields.email.unique = false

const ArchivedCandidatSchema = new Schema(ArchivedCandidatFields, {
  timestamps: true,
})

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
