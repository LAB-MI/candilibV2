import moment from 'moment'

const config = {
  secret: process.env.SECRET || 'secret',
  candidatTokenExpiration: process.env.CANDIDAT_EXPIREDIN || '1h',
  get adminTokenExpiration () {
    const now = moment()
    const midnight = now
      .clone()
      .hour(23)
      .minute(59)
      .second(59)
      .millisecond(0)

    if (midnight.isBefore(now)) {
      midnight.add(1, 'days')
    }

    const duration = midnight.diff(now) / 1000

    return duration + 's'
  },

  USER_STATUS_LEVEL: {
    candidat: 0,
    admin: 1,
  },
}

export default config
