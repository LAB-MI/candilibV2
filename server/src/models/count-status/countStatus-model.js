import mongoose from 'mongoose'

const { Schema } = mongoose

const countStatusFields = {
  count: {
    type: Number,
    default: 0,
  },
  candidatStatus: {
    type: String,
    default: undefined,
    required: true,
  },
  departement: {
    type: String,
    default: undefined,
    required: true,
  },
}

const countStatusSchema = new Schema(countStatusFields, { timestamps: true })

countStatusSchema.index({ departement: 1, candidatStatus: 1 })

export default mongoose.model('CountStatus', countStatusSchema)
