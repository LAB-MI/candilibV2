import mongoose from 'mongoose'
import sanitizeHtml from 'sanitize-html'

import { email as emailRegex } from '../../util/regex'

const { Schema } = mongoose

const WhitelistedSchema = new Schema(
  {
    email: {
      type: String,
      required: true,
      trim: true,
      unique: true,
      match: emailRegex,
    },

    departement: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
)

WhitelistedSchema.pre('save', async function preSave () {
  const whitelisted = this
  whitelisted.email = sanitizeHtml(whitelisted.email.toLowerCase())
})

export default mongoose.model('Whitelisted', WhitelistedSchema, 'whitelisted')
