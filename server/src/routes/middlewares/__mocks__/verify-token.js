import config from '../../../config'

let idCandidat = 'test candidat id'
let level
export function __setIdCandidat (id) {
  idCandidat = id
  level = config.userStatusLevels.candidat
}

export function __setIdAdmin (id) {
  idCandidat = id
  level = config.userStatusLevels.admin
}

export function verifyToken (req, res, next) {
  req.userId = idCandidat
  req.userLevel = level
  next()
}
