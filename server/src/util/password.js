import generatePassword from 'generate-password'

export const createPassword = () =>
  generatePassword.generate({
    length: 14,
    numbers: true,
    symbols: true,
    uppercase: true,
    lowercase: true,
    excludeSimilarCharacters: true,
    strict: true,
  })
