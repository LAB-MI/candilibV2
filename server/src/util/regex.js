// eslint-disable-next-line no-useless-escape
export const email = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
export const phone = /^0[67][0-9]{8}$/
export const neph = /^[ 0-9]{10,19}$/
export const strongEnoughPassword = [
  /^.{8,}$/,
  /.*[0-9]+/,
  /.*[A-Z]+/,
  /.*[a-z]+/,
  /.*\W+/,
]
