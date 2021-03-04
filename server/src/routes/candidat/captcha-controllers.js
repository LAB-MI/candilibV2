import { getImage, startRoute } from './captcha-business'

export const initImage = async (req, res, next) => {
  await getImage(req, res, next)
}

export const initCaptcha = async (req, res, next) => {
  await startRoute(req, res, next)
}
