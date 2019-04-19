import config from '../../../config'

let idCandidat = 'test candidat id'
let level
let departements = ['75', '93']
export function __setIdCandidat (id) {
  idCandidat = id
  level = config.userStatusLevels.candidat
}

export function __setIdAdmin (id, __departements) {
  idCandidat = id
  level = config.userStatusLevels.admin
  departements = __departements
}

export function verifyToken (req, res, next) {
  req.userId = idCandidat
  req.userLevel = level
  req.departements = departements
  next()
}
