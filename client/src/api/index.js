import 'whatwg-fetch'

import candidat from './api-candidat'
import admin from './api-admin'
import apiPublic from './api-public'

export default {
  candidat,
  admin,
  public: apiPublic,
}
