export const getCandidatConfigBusiness = () => {
  const lineDelay = Number(process.env.LINE_DELAY) || 0
  return { lineDelay }
}
