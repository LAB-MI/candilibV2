import Joi from 'joi'

import {
  departement as departementRegex,
} from '../../util'

export const departementValidator = Joi.object({
  _id: Joi.string().trim().min(2).trim().pattern(departementRegex).required(),
  email: Joi.string().email().required(),
})
