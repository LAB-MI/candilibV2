import mongoose from 'mongoose'

const { Schema } = mongoose

const StatusSchema = new Schema(
  {
    type: {
      type: String,
    },
    message: {
      type: String,
    },
  },
  { timestamps: true },
)

export default mongoose.model('Status', StatusSchema)
