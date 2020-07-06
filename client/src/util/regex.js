// eslint-disable-next-line no-useless-escape
export const email = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
export const matricule = /^[0-9]{3,12}$/
export const neph = /^[0-9]{10,19}$/
export const phone = /^0[67][0-9]{8}$/

export const strongEnoughPasswordObject = {
  'Au moins 8 caractères': /^.{8,}$/,
  'Au moins un chiffre': /.*[0-9]+/,
  'Au moins une majuscule': /.*[A-Z]+/,
  'Au moins une minuscule': /.*[a-z]+/,
  'Au moins un caractère spécial': /.*\W+/,
}

export const strongEnoughPassword = Object.values(strongEnoughPasswordObject)
export const departementRegex = /^(([\d]{2})|(2[abAB]))$/
export const codePostalRegex = /([0-9AB]{2})[0-9]{3}/
export const firstNameAndLastName = /;/
