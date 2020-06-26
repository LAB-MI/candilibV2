import apiPaths from './api-paths'
import apiClient from './api-utils'

const apiPublic = {
  async getConfigCandidat () {
    const json = await apiClient.get(apiPaths.public.configCandidat, {
      headers: {
        'Content-Type': 'application/json',
      },
    })
    return json
  },

  async getActiveDepartementsId () {
    const json = await apiClient.get(`${apiPaths.public.departements}`, {
      headers: {
        'Content-Type': 'application/json',
      },
    })
    return json
  },

  async getCentresByDepartement (departement, uniq) {
    const json = await apiClient.get(
        `${apiPaths.public.centres}?departementId=${departement}` + (uniq ? '&uniq=true' : ''),
        {
          headers: {
            'Content-Type': 'application/json',
          },
        },
    )
    return json
  },
}

export default apiPublic
