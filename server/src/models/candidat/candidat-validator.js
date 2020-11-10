
import joi from 'joi'
import {
  email as emailRegex,
  phone as phoneRegex,
  neph as nephRegex,
} from '../../util'

export const candidatValidator = joi.object({
  adresse: joi.string().trim(),
  codeNeph: joi.string().trim().pattern(nephRegex).required(),
  email: joi.string().trim().pattern(emailRegex).required(),
  emailValidationHash: joi.string().trim(),
  isValidatedEmail: joi.boolean(),
  nomNaissance: joi.string().trim().uppercase().required(),
  portable: joi.string().trim().pattern(phoneRegex).required(),
  prenom: joi.string().trim(),
  departement: joi.string().trim().pattern(/[0-9AB]{2}/),
  homeDepartement: joi.string().trim().pattern(/[0-9AB]{2}/),
})
