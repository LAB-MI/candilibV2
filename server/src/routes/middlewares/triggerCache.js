import { placesAndGeoDepartementsAndCentresCache } from './ressource-cache'

export async function triggerCache (req, res, next) {
  if (process.env.NODE_ENV !== 'test') {
    if (!placesAndGeoDepartementsAndCentresCache.isActive) {
      setTimeout(() => {
        placesAndGeoDepartementsAndCentresCache.disableCache()
      },
      // 1000 * 60 * 60
      1000 * 30,
      )
    }
  }
  placesAndGeoDepartementsAndCentresCache.enableCache()
  next()
}
