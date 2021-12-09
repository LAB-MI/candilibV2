import { getIntanceAgenda } from '../automate'

export const getAutomateJobs = async (query = {}) => {
  const jobs = await getIntanceAgenda().jobs(query)
  // return jobs
  return jobs.map(job => {
    const {
      name,
      lastModifiedBy,
      repeatInterval,
      nextRunAt,
      lockedAt,
      lastRunAt,
      lastFinishedAt,
    } = job.attrs
    return {
      name,
      lastModifiedBy,
      repeatInterval,
      nextRunAt,
      lockedAt,
      lastRunAt,
      lastFinishedAt,

    }
  })
}
