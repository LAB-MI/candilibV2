import mongoose from 'mongoose'
import { codePostal } from '../../util'
import { anotherConnexion } from '../../mongo-connection'

const { Schema } = mongoose

const CentreSchema = new Schema(
  {
    nom: {
      $type: String,
      required: true,
      trim: true,
      uppercase: true,
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
    geoDepartement: {
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
    disabledAt: {
      $type: Date,
    },
  },
  { typeKey: '$type', timestamps: true },
)

CentreSchema.index({ departement: 1, nom: 1 }, { unique: true })
CentreSchema.index({ nom: 1, active: 1 })
CentreSchema.index({ geoDepartement: 1, active: 1 })

CentreSchema.virtual('getGeoDepartement').get(function () {
  const zipCode = this.adresse && this.adresse.match(codePostal)
  return (
    this.geoDepartement ||
    (zipCode && zipCode.length > 1 && zipCode[1]) ||
    this.departement
  )
})
const model = mongoose.model('Centre', CentreSchema)
export default model

export let CentreModelConnection
export let CentreModel
export const createConnectionCentreModel = async () => {
  CentreModelConnection = await anotherConnexion()
  CentreModel = CentreModelConnection.model('Centre', CentreSchema)
}
/**
 * @typedef {Object} CentreMongooseDocument
 * @property {string} nom - Nom du centre (de la ville du centre)
 * @property {string} label - Information complémentaire pour retrouver le point de rencontre du centre
 * @property {string} adresse - Adresse du centre
 * @property {string} departement - Département du centre
 * @property {string} geoDepartement - Département géographique du centre
 * @property {Geoloc} geoloc - Informations de géolocalisation du centre
 * @property {boolean} active - Si `false`, le centre n'apparaîtra pas dans les requêtes des utilisateurs
 * @property {string} disabledBy - Adresse courriel du dernier utilisateur ayant désactivé le centre
 * @property {string} disabledAt - Date à laquelle le centre a été désactivé
 *
 * @typedef {Object} module:models/centre/centre-model~Geoloc
 * @global
 * @property {string} type
 * @property {number[]} coordinates - Latitude ou longitude
 */
