import config from '../../../config'

let idUser = 'test candidat id'
let level
let departements = ['75', '93']
let candidatStatus = '0'
export function __setIdCandidat (id, candidStatus = '0') {
  idUser = id
  level = config.userStatusLevels.candidat
  candidatStatus = candidStatus
}

export function __setIdAdmin (id, __departements) {
  idUser = id
  level = config.userStatusLevels.admin
  departements = __departements
  candidatStatus = undefined
}

export function verifyToken (req, res, next) {
  req.userId = idUser
  req.userLevel = level
  req.departements = departements
  req.candidatStatus = candidatStatus
  next()
}

export function getToken (req, res, next) {
  req.userId = idUser
  req.userLevel = level
  req.departements = departements
  next()
}
