import Joi from 'joi'

import {
  departement as departementRegex,
} from '../../util'

export const userValidatorObject = {
  email: Joi.string().trim().min(1).required(),
  departements: Joi.array().items(
    Joi.string().trim().min(2).pattern(departementRegex),
  ),
  deletedAt: Joi.alternatives().try(
    Joi.string().trim().isoDate(),
    Joi.date(),
  ),
  deletedBy: Joi.string(),
  signUpDate: Joi.alternatives().try(
    Joi.string().trim().isoDate(),
    Joi.date(),
  ),
  status: Joi.string(),
  booked: Joi.string(),
}

export const userValidator = Joi.object({
  ...userValidatorObject,
  emailValidationHash: Joi.string().trim().min(2),
  passwordResetRequestedAt: Joi.alternatives().try(
    Joi.string().trim().isoDate(),
    Joi.date(),
  ),
  password: Joi.string().trim().required(),
})
