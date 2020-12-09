import mongoose from 'mongoose'

const { Schema } = mongoose

const ArchivedCandidatStatusFields = {
  candidatId: {
    type: Schema.Types.ObjectId,
    default: undefined,
    required: true,
  },
  status: {
    type: String,
    default: undefined,
    required: true,
  },
  lastSavedAt: {
    type: Date,
    default: undefined,
  },
  isArchived: {
    type: Boolean,
    default: false,
  },
}

const ArchivedCandidatStatusSchema = new Schema(ArchivedCandidatStatusFields, { timestamps: true })

ArchivedCandidatStatusSchema.index({ candidatId: 1, status: 1, createdAt: 1 })
ArchivedCandidatStatusSchema.index({ createdAt: 1, candidatId: 1, status: 1 })

export default mongoose.model('ArchivedCandidatStatus', ArchivedCandidatStatusSchema)
