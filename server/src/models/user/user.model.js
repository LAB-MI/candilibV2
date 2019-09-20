import mongoose from 'mongoose'
import {
  compareToHash,
  email as regexEmail,
  strongEnoughPassword,
  getHash,
} from '../../util'

const { Schema } = mongoose

export const UserFields = {
  email: {
    type: String,
    trim: true,
    match: regexEmail,
    required: true,
  },
  departements: {
    type: Array,
    default: [],
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
}

const UserSchema = new Schema(
  {
    ...UserFields,
    email: {
      ...UserFields.email,
      unique: true,
    },
    emailValidationHash: {
      type: String,
      required: false,
    },
    password: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
)

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
