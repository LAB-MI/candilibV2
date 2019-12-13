import mongoose from 'mongoose'

const { Schema } = mongoose

const CentreSchema = new Schema(
  {
    nom: {
      $type: String,
      required: true,
      trim: true,
    },
    label: {
      $type: String,
      required: true,
      trim: true,
    },
    adresse: {
      $type: String,
      required: true,
      trim: true,
    },
    departement: {
      $type: String,
      required: true,
      trim: true,
    },
    geoloc: {
      type: String,
      coordinates: [Number],
    },
    active: {
      $type: Boolean,
    },
    disabledBy: {
      $type: String,
    },
  },
  { typeKey: '$type', timestamps: true }
)

CentreSchema.index({ nom: 1, departement: 1 }, { unique: true })

export default mongoose.model('Centre', CentreSchema)

/**
 * @typedef {Object} CentreMongo
 * @property {string} nom - Nom du centre (de la ville du centre)
 * @property {string} label - Information complémentaire pour retrouver le point de rencontre du centre
 * @property {string} adresse - Adresse du centre
 * @property {string} departement - Département du centre
 * @property {Geoloc} geoloc - Informations de géolocalisation du centre
 * @property {boolean} active - Si `false`, le centre n'apparaitra pas dans les requêtes des utilisateurs
 * @property {string} disabledBy - Adresse courriel du dernier utilisateur ayant désactivé le centre
 */
/**
 * @typedef {Object} module:models/centre/centre-model~Geoloc
 * @global
 * @property {string} type
 * @property {number[]} coordinates - Latitude ou longitude
 */
