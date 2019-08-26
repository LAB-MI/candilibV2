import { appLogger } from './'

export const sendErrorResponse = () => (
  res,
  { loggerInfo, description, status }
) => {
  appLogger.info({
    ...loggerInfo,
    description,
  })

  return res.status(status || 500).json({
    message: description,
    success: false,
  })
}
