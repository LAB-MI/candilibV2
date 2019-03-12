import mongoose from 'mongoose'
import sanitizeHtml from 'sanitize-html'

import { email as emailRegex } from '../../util/regex'

const { Schema } = mongoose

const WhitelistedSchema = new Schema({
  email: {
    type: String,
    required: true,
    trim: true,
    unique: true,
    match: emailRegex,
  },
})

WhitelistedSchema.pre('save', async function preSave () {
  const whitelisted = this
  whitelisted.email = sanitizeHtml(whitelisted.email)
})

export default mongoose.model('Whitelisted', WhitelistedSchema, 'whitelisted')
