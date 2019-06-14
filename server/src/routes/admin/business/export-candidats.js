import { parseAsync } from 'json2csv'
import { DateTime } from 'luxon'

const fields = [
  {
    label: 'Code NEPH',
    value: 'codeNeph',
  },
  {
    label: 'Nom de naissance',
    value: 'nomNaissance',
  },
  {
    label: "Nom d'usage",
    value: 'nomNaissance',
  },
  {
    label: 'Prénom',
    value: 'prenom',
  },
  {
    label: 'email',
    value: 'email',
  },
]

const options = { fields, delimiter: ';', quote: '' }
const parseCandidats = candidatsData => parseAsync(candidatsData, options)

export const getCandidatsAsCsv = async candidats => {
  const csv = parseCandidats(candidats)
  return csv
}

export const getBookedCandidatsAsCsv = async candidats => {
  const fields = [
    {
      label: 'inspecteur',
      value: 'place.inspecteur',
    },
    {
      label: 'centre',
      value: 'place.centre',
    },
    {
      label: 'Date réservé',
      value: (row, field) =>
        row.place &&
        row.place.date &&
        DateTime.fromJSDate(row.place.date).toFormat('yyyy-MM-dd HH:mm'),
      stringify: true,
    },
    {
      label: 'Code NEPH',
      value: 'codeNeph',
    },
    {
      label: 'Nom de naissance',
      value: 'nomNaissance',
    },
    {
      label: 'Prénom',
      value: 'prenom',
    },
  ]

  const csv = parseAsync(candidats, { fields })

  return csv
}
