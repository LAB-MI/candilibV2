import { appLogger } from './'

export const sendErrorResponse = (
  res,
  { loggerInfo, message, status, otherData },
) => {
  appLogger.info({
    ...loggerInfo,
    description: message,
  })

  return res.status(status || 500).json({
    message,
    success: false,
    ...otherData,
  })
}
