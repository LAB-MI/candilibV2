import mongoose from 'mongoose'
import { email as emailRegex } from '../../util'

const { Schema } = mongoose

const DepartementSchema = new Schema(
  {
    _id: {
      type: String,
      trim: true,
    },
    email: {
      type: String,
      trim: true,
      match: emailRegex,
      required: true,
      unique: true,
    },
    isAddedRecently: {
      type: Boolean,
      default: false,
    },
    disableAt: {
      type: Date,
      default: undefined,
    },
  },
  { timestamps: true },
)

DepartementSchema.index({ isAddedRecently: 1 })

export default mongoose.model('departement', DepartementSchema)
