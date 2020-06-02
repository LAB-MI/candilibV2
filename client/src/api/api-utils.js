import store, { UNAUTHORIZED } from '../store'

const checkStatus = async response => {
  if (response.status === 401) {
    await store.dispatch(UNAUTHORIZED)
  }
  return response
}

const checkValidJson = async response => {
  let data
  try {
    data = await response.json()
    return data
  } catch (e) {
    throw new Error('Oups, une petite erreur est survenue.')
  }
}

const fetchClient = (url, options) => fetch(url, options).then(checkStatus)
const jsonClient = (url, options) => fetchClient(url, options).then(checkValidJson)

const apiClient = {
  post: (url, options) => jsonClient(url, { ...options, method: 'post' }),
  get: (url, options) => jsonClient(url, { ...options, method: 'GET' }),
  getRaw: (url, options) => fetchClient(url, { ...options, method: 'GET' }),
  put: (url, options) => jsonClient(url, { ...options, method: 'PUT' }),
  patch: (url, options) => jsonClient(url, { ...options, method: 'PATCH' }),
  delete: (url, options) => jsonClient(url, { ...options, method: 'DELETE' }),
}

export default apiClient
