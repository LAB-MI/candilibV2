export const getCandidatConfigBusiness = () => {
  const lineDelay = Number(process.env.LINE_DELAY)
  return { lineDelay }
}
