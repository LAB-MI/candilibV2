import mongoose from 'mongoose'

const { Schema } = mongoose

const ImageSchema = new Schema(
  {
    type: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    data: {
      type: Buffer,
      required: true,
    },
    path: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  },
)


const model = mongoose.model('Image', ImageSchema)

export default model
