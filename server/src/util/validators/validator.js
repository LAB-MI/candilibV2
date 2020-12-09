import Joi from 'joi'
import {
  email as emailRegex,
  phone as phoneRegex,
  neph as nephRegex,
} from '../../util'

/**
 * Contruisre le schema du validateur
 * @param {Object} objectValidators
 */
export const createValidator = (objectValidators) => {
  return Joi.object(objectValidators)
}

/**
 * @type {import('joi').StringSchema}
 */
export const stringObjValidator = Joi.string().trim()

/**
 * @type {import('joi').BooleanSchema}
 */
export const booleanObjValidator = Joi.boolean()

/**
 * @type {import('joi').StringSchema}
 */
export const departementObjValidator = Joi.string().trim().pattern(/[0-9AB]{2}/)

/**
 * @type {import('joi').StringSchema}
 */
export const adresseObjValidator = Joi.string().trim()

/**
 * @type {import('joi').StringSchema}
 */
export const codeNephObjValidator = Joi.string().trim().pattern(nephRegex).required()

/**
 * @type {import('joi').StringSchema}
 */
export const emailObjValidator = Joi.string().trim().pattern(emailRegex).required()

/**
 * @type {import('joi').StringSchema}
 */
export const nameObjValidator = Joi.string().trim().uppercase().required()

/**
 * @type {import('joi').StringSchema}
 */
export const phoneObjValidator = Joi.string().trim().pattern(phoneRegex).required()

/**
 *@type {import('joi').NumberSchema}
 */
export const countObjValidator = Joi.number()

/**
 * @type {import('joi').StringSchema}
 */
export const statusObjValidator = Joi.string().trim().required()
