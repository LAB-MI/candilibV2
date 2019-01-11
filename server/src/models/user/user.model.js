import mongoose from 'mongoose'
import {
  compareToHash,
  email as regexEmail,
  strongEnoughPassword,
  getHash,
} from '../../util'

const { Schema } = mongoose

const UserSchema = new Schema({
  email: {
    type: String,
    trim: true,
    unique: true,
    match: regexEmail,
    required: true,
  },
  password: {
    type: String,
    required: true,
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
    default: 'admin',
  },
})

UserSchema.pre('save', async function preSave () {
  const user = this

  // Only hash the password if it has been modified (or is new)
  if (!user.isModified('password')) return

  const isPasswordStrongEnough = strongEnoughPassword.every(regex =>
    regex.test(user.password)
  )

  if (!isPasswordStrongEnough) {
    throw new Error('weak_password')
  }

  // Generate a hash
  user.password = getHash(user.password)
})

UserSchema.methods.comparePassword = function comparePassword (
  candidatePassword,
  cb
) {
  return compareToHash(candidatePassword, this.password)
}

export default mongoose.model('User', UserSchema)
