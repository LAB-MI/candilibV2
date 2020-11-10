import Joi from 'joi'

import {
  departement as departementRegex,
} from '../../util'

export const centreValidator = Joi.object({
  nom: Joi.string().trim().min(1).required(),
  label: Joi.string().trim().min(1).required(),
  adresse: Joi.string().trim().min(1).required(),
  departement: Joi.string().trim().min(2).pattern(departementRegex).required(),
  geoDepartement: Joi.string().trim().min(2).pattern(departementRegex).required(),
  geoloc: Joi.object({
    type: Joi.string().trim(),
    coordinates: Joi.array().items(Joi.number()),
  }),
  active: Joi.boolean(),
  disabledBy: Joi.string(),
  disabledAt: Joi.alternatives().try(
    Joi.string().trim().isoDate(),
    Joi.date(),
  ),
})
