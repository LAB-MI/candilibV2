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
  { timestamps: true }
)
export default mongoose.model('departement', DepartementSchema)

/**
 * @typedef {Object} DepartementMongooseDocument
 * @property {string} _id - Code département (ex 75, 2B, 973)
 * @property {string} email - Adresse couriel de contact du département
 */
