import config from '../../../config'

let idUser = 'test candidat id'
let level
let departements = ['75', '93']
export function __setIdCandidat (id) {
  idUser = id
  level = config.userStatusLevels.candidat
}

export function __setIdAdmin (id, __departements) {
  idUser = id
  level = config.userStatusLevels.admin
  departements = __departements
}

export function verifyToken (req, res, next) {
  req.userId = idUser
  req.userLevel = level
  req.departements = departements
  next()
}
