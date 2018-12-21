import bcrypt from 'bcryptjs'

export function getHash (password) {
  return bcrypt.hashSync(password, 8)
}

export function compareToHash (original, password) {
  return bcrypt.compareSync(original, password)
}
