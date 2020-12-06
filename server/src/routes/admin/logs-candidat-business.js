import { getLogsByFilter } from '../../models/logs-candidat/logs-queries'
import { getFrenchLuxonFromJSDate } from '../../util'
// import { appLogger } from '../../util'
// TODO: NEED MORE OPTIMISE
export const getLogsByFilters = async (filters) => {
  const formatedData = {}
  const filteredLogs = await getLogsByFilter(filters)
  filteredLogs.forEach((item) => {
    const { beginAt, savedAt, content } = item
    const parsedContent = JSON.parse(content)
    const beginHourRange = getFrenchLuxonFromJSDate(beginAt).hour
    const endHourRange = getFrenchLuxonFromJSDate(savedAt).hour
    const beginAndEndHourString = `${beginHourRange}_${endHourRange}`

    if (!formatedData[beginAndEndHourString]) {
      formatedData[beginAndEndHourString] = {}
    }
    Object
      .entries(parsedContent).forEach(([departement, statusesLogs]) => {
        if (!formatedData[beginAndEndHourString][departement]) {
          formatedData[beginAndEndHourString][departement] = {}
        }

        Object.entries(statusesLogs)
          .forEach(([status, { logs }]) => {
            if (!formatedData[beginAndEndHourString][departement][status]) {
              formatedData[beginAndEndHourString][departement][status] = {}
            }
            const logsContent = Object.entries(logs)
            if (logsContent?.length) {
              logsContent
                .forEach(([path, count]) => {
                  if (!formatedData[beginAndEndHourString][departement][status][path]) {
                    formatedData[beginAndEndHourString][departement][status][path] = count
                  } else {
                    const initialValue = formatedData[beginAndEndHourString][departement][status][path]
                    formatedData[beginAndEndHourString][departement][status][path] = initialValue + count
                  }
                })
            }
          })
      })
  })
  return formatedData
}
