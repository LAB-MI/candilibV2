import { countObjValidator, createValidator, departementObjValidator, statusObjValidator } from './validator'

const countStatusSchemaValid = {
  count: countObjValidator,
  departement: departementObjValidator.required(),
  candidatStatus: statusObjValidator,
}

export const countStatusValidator = createValidator(countStatusSchemaValid)
