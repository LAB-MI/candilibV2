import config from '../../../config'

export const getCandidatConfigBusiness = () => {
  const lineDelay = config.LINE_DELAY
  return { lineDelay }
}
