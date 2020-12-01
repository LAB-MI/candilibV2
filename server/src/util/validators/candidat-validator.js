import {
  createValidator,
  adresseObjValidator,
  booleanObjValidator,
  codeNephObjValidator,
  departementObjValidator,
  emailObjValidator,
  nameObjValidator,
  phoneObjValidator,
  stringObjValidator,
} from './validator'

export const candidatSchemaValid = {
  adresse: adresseObjValidator,
  codeNeph: codeNephObjValidator,
  email: emailObjValidator,
  emailValidationHash: stringObjValidator,
  isValidatedEmail: booleanObjValidator,
  nomNaissance: nameObjValidator,
  portable: phoneObjValidator,
  prenom: stringObjValidator,
  departement: departementObjValidator,
  homeDepartement: departementObjValidator,
}

/**
 *
 */
export const candidatValidator = createValidator(candidatSchemaValid)
