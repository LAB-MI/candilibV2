import mongoose from 'mongoose'

import { email as emailRegex } from '../../util/regex'

const { Schema } = mongoose

const whitelistedSchema = new Schema({
  email: {
    type: String,
    required: false,
    trim: true,
    unique: true,
    match: emailRegex,
  },
})

export default mongoose.model('Whitelisted', whitelistedSchema, 'whitelisted')
