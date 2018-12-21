import mongoose from 'mongoose'
import util from '../util'

const { Schema } = mongoose

const userSchema = new Schema({
  email: {
    type: String,
    trim: true,
    unique: true,
    match: util.regex.email,
    required: true,
  },
  password: {
    type: String,
    required: true,
    validate: {
      validator (pwd) {
        return util.regex.strongEnoughPassword.every(regex => regex.test(pwd))
      },
      message: props => `The password chosen is not strong enough`,
    },
  },
  isDeleted: {
    type: Boolean,
    default: false,
  },
  signUpDate: {
    type: Date,
    default: Date.now(),
  },
  status: {
    type: String,
    default: 'candidat',
  },
})

export default mongoose.model('User', userSchema)
