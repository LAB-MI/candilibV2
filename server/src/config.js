import moment from 'moment'

const isProduction = process.env.NODE_ENV === 'production'

const DEFAULT_PUBLIC_URL = isProduction
  ? 'https://beta.interieur.gouv.fr/candilib'
  : 'http://localhost:8080/candilib'

const userStatuses = {
  CANDIDAT: 'candidat',
  ADMIN: 'admin',
}

const userStatusLevels = {
  [userStatuses.CANDIDAT]: 0,
  [userStatuses.ADMIN]: 1,
}

const config = {
  secret: process.env.SECRET || 'secret',
  candidatTokenExpiration: process.env.CANDIDAT_EXPIREDIN || '3d',
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

  userStatuses,

  userStatusLevels,

  dbName: process.env.DB_NAME,
  dbUser: process.env.DB_USER,
  dbPass: process.env.DB_PASS,

  mailFrom: process.env.MAIL_FROM || 'noreply@localhost.com',

  smtpServer: process.env.SMTP_SERVER || 'localhost',
  smtpService: process.env.SMTP_SERVICE || undefined,
  smtpUser: process.env.SMTP_USER,
  smtpPass: process.env.SMTP_PASS,
  smtpPort: process.env.SMTP_PORT || 25,

  PUBLIC_URL: process.env.PUBLIC_URL || DEFAULT_PUBLIC_URL,
  CANDIDAT_ROUTE: '/candidat',
  ADMIN_ROUTE: '/admin',
}

export const dbOptions = {
  db: config.dbName,
  user: config.dbUser,
  pass: config.dbPass,
}

export const smtpOptions = {
  host: config.smtpServer,
  port: config.smtpPort,
  secure: false,
  tls: {
    // do not failed with selfsign certificates
    rejectUnauthorized: false,
  },
}

if (config.smtpUser) {
  smtpOptions.auth = {
    user: config.smtpUser,
    pass: config.smtpPass,
  }
}

export default config
