import { appLogger } from './'

export const sendErrorResponse = (
  res,
  { loggerInfo, description, status, otherData }
) => {
  appLogger.info({
    ...loggerInfo,
    description,
  })

  return res.status(status || 500).json({
    message: description,
    success: false,
    ...otherData,
  })
}
