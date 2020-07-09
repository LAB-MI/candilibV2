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
  },
  { timestamps: true },
)
export default mongoose.model('departement', DepartementSchema)
