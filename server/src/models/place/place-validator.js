import Joi from 'joi'
import { DateTime } from 'luxon'
import Mongoose from 'mongoose'

import { userValidatorObject } from '../user/user-validator'

const isTest = process.env.NODE_ENV === 'test'
const placeObjectValidator = {
  inspecteur: Joi.alternatives().try(
    Joi.string().trim().min(1),
    Joi.object(),
  ),
  centre: Joi.alternatives().try(
    Joi.string().trim().min(1),
    Joi.object(),
  ),
  date: Joi.alternatives().try(
    Joi.string().trim().isoDate(),
    Joi.date(),
    Joi.object().instance(DateTime),
  ),
  bookedAt: Joi.alternatives().try(
    Joi.string().trim().isoDate(),
    Joi.date(),
  ),
  bookedByAdmin: Joi.object({
    type: Joi.object({
      ...userValidatorObject,
      _id: Joi.string().trim().min(1).required(),
    }),
  }),
  visibleAt: Joi.alternatives().try(
    Joi.string().trim().isoDate(),
    Joi.date(),
    Joi.object().instance(DateTime),
  ),
  candidat: Joi.alternatives().try(
    Joi.string().trim().pattern(/[0-9a-fA-F]{24}/),
    Joi.object().instance(Mongoose.Types.ObjectId),
  ),
  booked: Joi.boolean(),
}

if (isTest) {
  placeObjectValidator.createdAt = Joi.alternatives().try(
    Joi.string().trim().isoDate(),
    Joi.date(),
    Joi.object().instance(DateTime),
  )
}
export const placeValidator = Joi.object(placeObjectValidator)
