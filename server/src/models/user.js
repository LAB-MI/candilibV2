import mongoose from 'mongoose'
import {
  compareToHash,
  email as regexEmail,
  strongEnoughPassword,
  getHash,
} from '../util'

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
    default: 'candidat',
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

export const User = mongoose.model('User', UserSchema)

export const findUserByEmail = async email => {
  const user = await User.findOne({ email })
  return user
}

export const findUserByCredentials = async (email, password) => {
  const user = await User.findOne({ email })
  const isValidCredentials = user.comparePassword(password)
  if (!isValidCredentials) {
    return null
  }
  return user
}

export const createUser = async (email, password) => {
  const isPasswordStrongEnough = strongEnoughPassword.every(regex =>
    regex.test(password)
  )
  if (!isPasswordStrongEnough) {
    throw new Error('weak_password')
  }
  const user = new User({ email, password })
  await user.save()
  return user
}

export const deleteUserByEmail = async email => {
  const user = await User.findOne({ email })
  if (!user) {
    throw new Error('No user found')
  }
  await user.delete()
  return user
}

export const deleteUser = async user => {
  if (!user) {
    throw new Error('No user given')
  }
  await user.delete()
  return user
}

export const updateUserEmail = async (user, email) => {
  if (!user) {
    throw new Error('user is undefined')
  }
  await user.update({ email })
  const updatedUser = await User.findById(user._id)
  return updatedUser
}

export const updateUserPassword = async (user, password) => {
  await user.update({ password })
  const updatedUser = await User.findById(user._id)
  return updatedUser
}
