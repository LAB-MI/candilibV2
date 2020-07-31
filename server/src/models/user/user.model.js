/**
 * Module de définition du Schéma et du modèle de User
 *
 * @module models/user/user-model
 */
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
  deletedAt: {
    type: Date,
  },
  deletedBy: {
    type: String,
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
    passwordResetRequestedAt: {
      type: Date,
      default: undefined,
    },
    password: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  },
)

UserSchema.index({ email: 1 })
UserSchema.index({ deletedAt: 1 })

UserSchema.set('toJSON', {
  transform (doc, ret /*, opt */) {
    delete ret.password
    delete ret.__v
    return ret
  },
})

UserSchema.pre('save', async function preSave () {
  const user = this

  // Only hash the password if it has been modified (or is new)
  if (!user.isModified('password')) return

  const isPasswordStrongEnough = strongEnoughPassword.every(regex =>
    regex.test(user.password),
  )

  if (!isPasswordStrongEnough) {
    throw new Error('weak_password')
  }

  // Generate a hash
  user.password = getHash(user.password)
})

UserSchema.methods.comparePassword = function comparePassword (
  candidatePassword,
  cb,
) {
  return compareToHash(candidatePassword, this.password)
}

export default mongoose.model('User', UserSchema)

/**
 * @typedef {Object} UserMongooseDocument
 * @mixes import('mongoose').Document
 *
 * @property {string} email
 * @property {string[]} departements
 * @property {Date} deletedAt
 * @property {string} deletedBy
 * @property {Date} signUpDate
 * @property {string} status
 */
