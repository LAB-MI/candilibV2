import mongoose from 'mongoose'

const { Schema } = mongoose

const SiteSchema = new Schema({
  nom: {
    type: String,
    required: true,
    trim: true,
    unique: true,
  },
  label: {
    type: String,
    required: true,
    trim: true,
  },
  adresse: {
    type: String,
    required: true,
    trim: true,
  },
})

export default mongoose.model('Site', SiteSchema)
