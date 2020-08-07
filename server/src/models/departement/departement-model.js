import mongoose from 'mongoose'
import { email as emailRegex } from '../../util'
import { anotherConnexion } from '../../mongo-connection'

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

export let DepartementModelConnection
export let DepartementModel
export const createConnectionDepartementModel = async () => {
  DepartementModelConnection = await anotherConnexion()
  DepartementModel = DepartementModelConnection.model('departement', DepartementSchema)
}
