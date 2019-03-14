let idCandidat = 'test candidat id'
export function __setIdCandidat (id) {
  idCandidat = id
}

export function verifyToken (req, res, next) {
  req.userId = idCandidat
  next()
}
