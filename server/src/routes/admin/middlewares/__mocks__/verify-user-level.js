export function verifyRepartiteurLevel () {
  return function (req, res, next) {
    return next()
  }
}

export function verifyUserLevel (minimumUserLevel) {
  return function (req, res, next) {
    return next()
  }
}

export function verifyDelegueLevel () {
  return function (req, res, next) {
    return next()
  }
}

export function verifyAdminLevel () {
  return function (req, res, next) {
    return next()
  }
}
