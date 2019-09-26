/**
 * Gestion des requêtes
 * @module
 */
import superagent from 'superagent'

export const asyncCompose = (fn1, fn2) => async x => fn1(await fn2(x))
export const asyncComposeArray = fns => fns.reduce(asyncCompose, x => x)
export const asyncComposeArgs = (...args) => args.reduce(asyncCompose, x => x)

export const getJson = async url =>
  (await superagent.get(url).set('accept', 'application/json')).body

export const postJson = async ({ url, body, headers }) => {
  let request = superagent
    .post(url)
    .send(body)
    .set('Content-Type', 'application/json')
    .set('accept', 'application/json')

  if (headers) {
    request = Object.entries(headers).reduce(
      (acc, [key, value]) => acc.set(key, value),
      request,
    )
  }

  return (await request).body
}
