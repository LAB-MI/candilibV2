import { Parser as Json2csvParser } from 'json2csv'
import moment from 'moment'

export const getCandidatsAsCsv = async candidats => {
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

  const json2csvParser = new Json2csvParser({ fields })
  const csv = json2csvParser.parse(candidats)

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
        moment(row.place.date).format('YYYY-MM-DD HH:mm'),
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

  const json2csvParser = new Json2csvParser({ fields })
  const csv = json2csvParser.parse(candidats)

  return csv
}
