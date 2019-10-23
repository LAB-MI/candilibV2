import generatePassword from 'generate-password'

export const createPassword = () =>
  generatePassword.generate({
    length: 12,
    numbers: true,
    symbols: true,
  })
