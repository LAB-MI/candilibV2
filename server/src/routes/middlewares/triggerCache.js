import { placesAndGeoDepartementsAndCentresCache } from './ressource-cache'

export async function triggerCache (req, res, next) {
  if (!placesAndGeoDepartementsAndCentresCache.isActive) {
    setTimeout(() => {
      placesAndGeoDepartementsAndCentresCache.disableCache()
    }, 1000 * 60 * 60)
  }

  placesAndGeoDepartementsAndCentresCache.enableCache()
  next()
}
