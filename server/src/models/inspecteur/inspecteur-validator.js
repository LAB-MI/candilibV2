import Joi from 'joi'

import {
  matricule,
  departement as departementRegex,
} from '../../util'

export const inspecteurValidator = Joi.object({
  active: Joi.boolean(),
  nom: Joi.string().trim().min(1).required(),
  prenom: Joi.string().trim().min(1),
  email: Joi.string().trim().email().required(),
  matricule: Joi.string().trim().pattern(matricule).required(),
  departement: Joi.string().trim().min(2).pattern(departementRegex),
})
