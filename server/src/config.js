const config = {
  secret: process.env.SECRET || 'secret',
  tokenCandidatExpired: process.env.CANDIDAT_EXPIREDIN || '1h',
}

export default config
