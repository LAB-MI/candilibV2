/**
 * Model Place
 * @module models/place/place-model
 */
import mongoose from 'mongoose'

import { INSPECTEUR_SCHEDULE_INCONSISTENCY_ERROR } from './errors.constants'

import { getFrenchLuxonFromJSDate } from '../../util/date-util'
import { UserFields } from '../user/user.model'

const { Schema } = mongoose
const ObjectId = Schema.Types.ObjectId

/**
 * @typedef {Object} PlaceFields
 * @property {ObjectId} inspecteur
 * @property {centre} centre
 * @property {date} date
 * @property {date} bookedAt
 * @property {UserFields} bookedByAdmin
 */
export const placeCommonFields = {
  inspecteur: {
    type: ObjectId,
    required: false,
    trim: true,
    ref: 'Inspecteur',
  },
  centre: {
    type: ObjectId,
    required: false,
    ref: 'Centre',
  },
  // dateTime
  date: {
    type: Date,
    required: false,
  },
  bookedAt: {
    type: Date,
    required: false,
  },
  bookedByAdmin: {
    type: {
      ...UserFields,
      _id: {
        type: ObjectId,
        required: true,
      },
    },
    required: false,
  },
}

/**
 * @type {PlaceModel}
 */
const PlaceSchema = new Schema(
  {
    ...placeCommonFields,
    candidat: {
      type: ObjectId, // ObjectId du candidat ayant réservé cette place
      required: false,
      ref: 'Candidat',
    },
  },
  {
    timestamps: true,
  }
)

PlaceSchema.index({ date: 1, inspecteur: 1 }, { unique: true })

PlaceSchema.pre('save', async function preSave () {
  const place = this
  const model = mongoose.model('Place')
  // Rechercher les places de cet inspecteur à cette date
  const places = await model.find({
    inspecteur: place.inspecteur,
    date: {
      $gte: getFrenchLuxonFromJSDate(place.date)
        .startOf('day')
        .toJSDate(),
      $lt: getFrenchLuxonFromJSDate(place.date)
        .endOf('day')
        .toJSDate(),
    },
  })

  if (places.length) {
    if (
      places.some(
        currentPlace =>
          currentPlace.centre.toString() !==
          (place.centre._id || place.centre).toString()
      )
    ) {
      const error = new Error(INSPECTEUR_SCHEDULE_INCONSISTENCY_ERROR)
      error.inspecteur = place.inspecteur
      throw error
    }
  }
})

const model = mongoose.model('Place', PlaceSchema)

/**
 * @typedef {Object} PlaceModel
 * @property {ObjectId} inspecteur
 * @property {centre} centre
 * @property {date} date
 * @property {date} bookedAt
 * @property {UserFields} bookedByAdmin
 * @property {ObjectId} candidat
 */

export default model
