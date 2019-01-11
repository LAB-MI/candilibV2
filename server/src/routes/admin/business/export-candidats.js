import { Parser as Json2csvParser } from 'json2csv'

import { findAllCandidatsLean } from '../../../models/candidat'

export const getCandidatsAsCsv = async () => {
  const candidats = await findAllCandidatsLean()

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
