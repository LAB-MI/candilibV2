import { createCandidat } from '../../../models/candidat'
import Candidat from '../../../models/candidat/candidat.model'
import {
  getFrenchLuxon,
  NO_CANDILIB,
  EPREUVE_PRATIQUE_OK,
  NB_FAILURES_KO,
  getFrenchLuxonFromISO,
} from '../../../util'
import {
  ECHEC,
  NO_EXAMINABLE,
  ABSENT,
  NO_ADMISSIBLE,
  CANCELED,
} from '../../../models/candidat/objetDernierNonReussite.values'
import { REASON_EXAM_FAILED } from '../../common/reason.constants'
import {
  findCentreByNameAndDepartement,
  createCentre,
} from '../../../models/centre'
import { createPlace } from '../../../models/place'
import {
  findInspecteurByMatricule,
  createInspecteur,
} from '../../../models/inspecteur'
import { createArchivedCandidat } from '../../../models/archived-candidat/archived-candidat.queries'

import {
  bookCandidatOnSelectedPlace,
  commonBasePlaceDateTime,
  createCandidatAndUpdate,
} from '../../../models/__tests__'

export const nowLuxon = getFrenchLuxon()

const dateReussiteETG = nowLuxon
  .minus({ days: 5 })
  .startOf('day')
  .toISO()

// const dateReussiteETGKO = nowLuxon
//   .minus({ years: 5 })
//   .startOf('day')
//   .toISO()

export const dateTimeDernierEchecPratique = nowLuxon.minus({ days: 5 })

const dateDernierEchecPratique = dateTimeDernierEchecPratique
  .toISO()
  .split('T')[0]

// const dateDernierEchecPratiqueAncien = nowLuxon
//   .minus({ days: config.timeoutToRetry })
//   .startOf('day')
//   .toISO()

export const dateReussitePratique = nowLuxon.minus({ days: 5 }).startOf('day')
export const dateReussitePratiqueEndOfDay = nowLuxon.endOf('day')

const isValidatedEmail = true
const adresse = '40 Avenuedes terroirs de France 75012 Paris'
const portable = '0676543986'

export const dateTimeDernierEchecPratiqueWithPenalty = penalty =>
  dateTimeDernierEchecPratique.minus({ days: penalty })

export const dateDernierEchecPratiqueWithPenalty = penalty =>
  dateTimeDernierEchecPratiqueWithPenalty(penalty)
    .toISO()
    .split('T')[0]

const centre1 = {
  departement: '92',
  nom: 'CENTRE 1',
  label: "Centre d'examen 1",
  adresse: '1 rue Test, ville test, FR, 92001',
  lon: 48,
  lat: 3,
}
const centre3 = {
  departement: '92',
  nom: 'CENTRE 3',
  label: "Centre d'examen 3",
  adresse: '1 rue Test, ville test, FR, 92001',
  lon: 48,
  lat: 3,
}

const centre2 = {
  departement: '91',
  nom: 'CENTRE 91',
  label: "Centre d'examen 91",
  adresse: '1 rue Test, ville test, FR, 91001',
  lon: 48,
  lat: 3,
}

const inspecteur1 = {
  nom: 'Mulder',
  prenom: 'Fox',
  matricule: '047101111',
  email: 'fox.mulder@x-files.com',
  departement: '93',
}

const candidatFailureExam = {
  // candidat échec pratique récent
  codeNeph: '0938743208650',
  nomNaissance: 'ZANETTI',
  prenom: 'BUBBA',
  email: 'bubbazanetti1@candilib.com',
  dateReussiteETG,
  nbEchecsPratiques: '2',
  reussitePratique: '',
  candidatExistant: 'OK',
  isValidatedByAurige: false,
  isValidatedEmail,
  departement: '93',
  adresse,
  portable,
  noReussites: [
    {
      date: dateDernierEchecPratiqueWithPenalty(45 * 3),
      reason: ECHEC,
    },
    {
      date: dateDernierEchecPratiqueWithPenalty(45 * 2),
      reason: NO_EXAMINABLE,
    },
    {
      date: dateDernierEchecPratiqueWithPenalty(45),
      reason: ABSENT,
    },
    {
      date: dateDernierEchecPratique,
      reason: ECHEC,
    },
  ],
  places: [
    {
      date: dateTimeDernierEchecPratiqueWithPenalty(45 * 3).toISO(),
      centre: centre1,
      inspecteur: inspecteur1,
      archivedAt: dateTimeDernierEchecPratiqueWithPenalty(45 * 3 - 2).toISO(),
      archiveReason: REASON_EXAM_FAILED + NO_CANDILIB,
      isCandilib: false,
    },
    {
      date: dateTimeDernierEchecPratiqueWithPenalty(45 * 2).toISO(),
      centre: centre1,
      inspecteur: inspecteur1,
      archiveReason: REASON_EXAM_FAILED,
      isCandilib: true,
    },
    {
      date: dateTimeDernierEchecPratiqueWithPenalty(45).toISO(),
      centre: centre1,
      inspecteur: inspecteur1,
      archiveReason: REASON_EXAM_FAILED,
      isCandilib: true,
    },
    {
      date: dateTimeDernierEchecPratique.toISO(),
      centre: centre1,
      inspecteur: inspecteur1,
      archiveReason: REASON_EXAM_FAILED,
      isCandilib: true,
    },
  ],
}

const candidatFailureExam2 = {
  ...candidatFailureExam,
  nomNaissance: 'ZANETTI2',
  prenom: 'BUBBA2',
  email: 'bubbazanetti2@candilib.com',
  noReussites: [
    {
      date: dateDernierEchecPratiqueWithPenalty(45 * 3),
      reason: NO_EXAMINABLE,
    },
    {
      date: dateDernierEchecPratiqueWithPenalty(45 * 2),
      reason: NO_EXAMINABLE,
    },
    {
      date: dateDernierEchecPratiqueWithPenalty(45),
      reason: ABSENT,
    },
    {
      date: dateDernierEchecPratique,
      reason: ABSENT,
    },
  ],
  places: [
    {
      date: dateTimeDernierEchecPratiqueWithPenalty(45 * 3).toISO(),
      centre: centre1,
      inspecteur: inspecteur1,
      archivedAt: dateTimeDernierEchecPratiqueWithPenalty(45 * 3 - 2).toISO(),
      archiveReason: REASON_EXAM_FAILED + NO_CANDILIB,
      isCandilib: false,
    },
    {
      date: dateTimeDernierEchecPratiqueWithPenalty(45 * 2).toISO(),
      centre: centre1,
      inspecteur: inspecteur1,
      archiveReason: REASON_EXAM_FAILED,
      isCandilib: true,
    },
    {
      date: dateTimeDernierEchecPratiqueWithPenalty(45).toISO(),
      centre: centre1,
      inspecteur: inspecteur1,
      archiveReason: REASON_EXAM_FAILED,
      isCandilib: true,
    },
    {
      date: dateTimeDernierEchecPratique.toISO(),
      centre: centre3,
      inspecteur: inspecteur1,
      archiveReason: REASON_EXAM_FAILED,
      isCandilib: true,
    },
  ],
}

const candidatFailureExam3 = {
  // candidat échec pratique récent
  codeNeph: '0938743208650',
  nomNaissance: 'ZANETTI3',
  prenom: 'BUBBA3',
  email: 'bubbazanetti13@candilib.com',
  dateReussiteETG,
  nbEchecsPratiques: '2',
  reussitePratique: '',
  candidatExistant: 'OK',
  isValidatedByAurige: false,
  isValidatedEmail,
  departement: '93',
  adresse,
  portable,
  noReussites: [
    {
      date: dateDernierEchecPratiqueWithPenalty(45 * 3),
      reason: ECHEC,
    },
    {
      date: dateDernierEchecPratiqueWithPenalty(45 * 2),
      reason: ABSENT,
    },
    {
      date: dateDernierEchecPratiqueWithPenalty(45),
      reason: ABSENT,
    },
    {
      date: dateDernierEchecPratique,
      reason: ECHEC,
    },
  ],
  places: [
    {
      date: dateTimeDernierEchecPratiqueWithPenalty(45 * 3).toISO(),
      centre: centre1,
      inspecteur: inspecteur1,
      archivedAt: dateTimeDernierEchecPratiqueWithPenalty(45 * 3 - 2).toISO(),
      archiveReason: REASON_EXAM_FAILED + NO_CANDILIB,
      isCandilib: false,
    },
    {
      date: dateTimeDernierEchecPratiqueWithPenalty(45 * 2).toISO(),
      centre: centre1,
      inspecteur: inspecteur1,
      archiveReason: REASON_EXAM_FAILED,
      isCandilib: true,
    },
    {
      date: dateTimeDernierEchecPratiqueWithPenalty(45).toISO(),
      centre: centre1,
      inspecteur: inspecteur1,
      archiveReason: REASON_EXAM_FAILED + NO_CANDILIB,
      isCandilib: true,
    },
    {
      date: dateTimeDernierEchecPratique.toISO(),
      centre: centre1,
      inspecteur: inspecteur1,
      archiveReason: REASON_EXAM_FAILED,
      isCandilib: true,
    },
  ],
}

const candidatFailureExamWith5Failures = {
  // candidat avec 5 échec pratique récent
  codeNeph: '0938743208651',
  nomNaissance: 'TEST',
  prenom: 'Fivefailures',
  email: 'fivefailures.test@candilib.com',
  dateReussiteETG,
  nbEchecsPratiques: '5',
  noReussites: [
    {
      date: dateDernierEchecPratiqueWithPenalty(45 * 2),
      reason: NO_EXAMINABLE,
    },
    {
      date: dateDernierEchecPratiqueWithPenalty(45),
      reason: ABSENT,
    },
    {
      date: dateDernierEchecPratique,
      reason: ECHEC,
    },
  ],
  reussitePratique: '',
  candidatExistant: 'OK',
  isValidatedByAurige: false,
  isValidatedEmail,
  departement: '93',
  adresse,
  portable,
  places: [
    {
      date: dateTimeDernierEchecPratiqueWithPenalty(45).toISO(),
      centre: centre1,
      inspecteur: inspecteur1,
      archiveReason: REASON_EXAM_FAILED,
      isCandilib: true,
    },
    {
      date: dateTimeDernierEchecPratique.toISO(),
      centre: centre1,
      inspecteur: inspecteur1,
      archiveReason: REASON_EXAM_FAILED,
      isCandilib: true,
    },
  ],
  archiveReason: NB_FAILURES_KO,
  archivedAt: nowLuxon.toISO(),
}

const candidatPassed = {
  // Candidat réussi la pratique
  codeNeph: '093123456789',
  nomNaissance: 'MAD',
  prenom: 'MAX',
  email: 'madmax@candilib.com',
  dateReussiteETG,
  nbEchecsPratiques: '',
  reussitePratique: dateReussitePratique.toISO(),
  candidatExistant: 'OK',
  isValidatedByAurige: false,
  isValidatedEmail,
  departement: '93',
  adresse,
  portable,
  noReussites: [],
  places: [
    {
      date: dateReussitePratique.toISO(),
      centre: centre1,
      inspecteur: inspecteur1,
      archiveReason: EPREUVE_PRATIQUE_OK,
      isCandilib: true,
    },
  ],
  archiveReason: EPREUVE_PRATIQUE_OK,
  archivedAt: nowLuxon.toISO(),
}

const candidatPassedCentre2 = {
  // Candidat réussi la pratique
  codeNeph: '093123456789',
  nomNaissance: 'MAD',
  prenom: 'MAX',
  email: 'madmax@candilib.com',
  dateReussiteETG,
  nbEchecsPratiques: '',
  reussitePratique: dateReussitePratique.toISO(),
  candidatExistant: 'OK',
  isValidatedByAurige: false,
  isValidatedEmail,
  departement: '93',
  adresse,
  portable,
  noReussites: [],
  places: [
    {
      date: dateReussitePratique.toISO(),
      centre: centre2,
      inspecteur: inspecteur1,
      archiveReason: EPREUVE_PRATIQUE_OK,
      isCandilib: true,
    },
  ],
  archiveReason: EPREUVE_PRATIQUE_OK,
  archivedAt: nowLuxon.toISO(),
}

const candidatPassedWithNoReussites = {
  ...candidatPassed,
  codeNeph: '0931234567891',
  nomNaissance: 'MAD1',
  email: 'madmax1@candilib.com',
  departement: '93',
  noReussites: [
    {
      date: dateDernierEchecPratiqueWithPenalty(45 * 2),
      reason: NO_EXAMINABLE,
    },
    {
      date: dateDernierEchecPratiqueWithPenalty(45),
      reason: ABSENT,
    },
  ],
  places: [
    {
      date: dateTimeDernierEchecPratiqueWithPenalty(45 * 2).toISO(),
      centre: centre1,
      inspecteur: inspecteur1,
      archiveReason: REASON_EXAM_FAILED,
      isCandilib: true,
    },
    {
      date: dateTimeDernierEchecPratiqueWithPenalty(45).toISO(),
      centre: centre1,
      inspecteur: inspecteur1,
      archiveReason: REASON_EXAM_FAILED,
      isCandilib: true,
    },
    {
      date: dateReussitePratique.toISO(),
      centre: centre1,
      inspecteur: inspecteur1,
      archiveReason: EPREUVE_PRATIQUE_OK,
      isCandilib: true,
    },
  ],
}

const candidatPassedNoCandilib = {
  ...candidatPassedWithNoReussites,
  // Candidat réussi la pratique
  codeNeph: '0931234567892',
  nomNaissance: 'MAD2',
  prenom: 'MAX2',
  email: 'madmax2@candilib.com',
  departement: '93',
  places: [
    {
      date: dateTimeDernierEchecPratiqueWithPenalty(45 * 2).toISO(),
      centre: centre1,
      inspecteur: inspecteur1,
      archiveReason: REASON_EXAM_FAILED,
      isCandilib: true,
    },
    {
      date: dateTimeDernierEchecPratiqueWithPenalty(45).toISO(),
      centre: centre1,
      inspecteur: inspecteur1,
      archiveReason: REASON_EXAM_FAILED + NO_CANDILIB,
      isCandilib: true,
    },
    {
      date: dateReussitePratique.toISO(),
      centre: centre1,
      inspecteur: inspecteur1,
      archiveReason: EPREUVE_PRATIQUE_OK + NO_CANDILIB,
      isCandilib: true,
    },
  ],
}

export const createOneCandidatForStat = async candidat => {
  const candidatCreated = await createCandidat(candidat)
  candidatCreated.isValidatedEmail = true
  candidatCreated.isValidatedByAurige = true
  candidatCreated.dateReussiteETG = candidat.dateReussiteETG
  candidatCreated.nbEchecsPratiques = candidat.nbEchecsPratiques
  candidatCreated.noReussites = candidat.noReussites

  // Places
  const places = await Promise.all(
    candidat.places.map(async place => {
      const { centre, inspecteur } = place
      const centreInDB = await findCentreByNameAndDepartement(
        centre.nom,
        centre.departement,
      )
      const inspecteurInDB = await findInspecteurByMatricule(
        inspecteur.matricule,
      )
      return {
        ...place,
        centre: centreInDB._id,
        inspecteur: inspecteurInDB._id,
      }
    }),
  )

  candidatCreated.places = places

  return candidatCreated.save()
}

export const createArchivedCandidatForStat = async candidat => {
  const candidatCreated = {
    ...candidat,
  }
  // Places
  if (candidat.places && candidat.places.length > 0) {
    const places = await Promise.all(
      candidat.places.map(async place => {
        const { centre, inspecteur } = place
        const centreInDB = await findCentreByNameAndDepartement(
          centre.nom,
          centre.departement,
        )
        const inspecteurInDB = await findInspecteurByMatricule(
          inspecteur.matricule,
        )
        return {
          ...place,
          centre: centreInDB._id,
          inspecteur: inspecteurInDB._id,
        }
      }),
    )
    candidatCreated.places = places
  }

  return createArchivedCandidat(candidatCreated)
}

const candidatsStat = [
  candidatFailureExam,
  candidatFailureExam2,
  candidatFailureExam3,
]
const archivedCandidatsStat = [
  candidatFailureExamWith5Failures,
  candidatPassed,
  candidatPassedWithNoReussites,
  candidatPassedNoCandilib,
  candidatPassedCentre2,
]

export const countSuccess = (departement, begin, end) => {
  const candidats = archivedCandidatsStat.filter(
    ({ places }) =>
      places
        .filter(
          el =>
            getFrenchLuxonFromISO(el.date) >= begin &&
            getFrenchLuxonFromISO(el.date) <= end,
        )
        .find(
          ({ archiveReason, centre }) =>
            archiveReason === EPREUVE_PRATIQUE_OK &&
            (!departement || centre.departement === departement),
        ) !== undefined,
  )
  return candidats.length
}

export const countAbsent = (departement, begin, end) => {
  return (
    noReussitesByResaon(candidatsStat, ABSENT, departement, begin, end).length +
    noReussitesByResaon(archivedCandidatsStat, ABSENT, departement, begin, end)
      .length
  )
}

export const countFailure = (departement, begin, end) => {
  return (
    noReussitesByResaon(candidatsStat, ECHEC, departement, begin, end).length +
    noReussitesByResaon(archivedCandidatsStat, ECHEC, departement, begin, end)
      .length
  )
}

export const countNotExamined = (departement, begin, end) => {
  return (
    noReussitesByResaon(candidatsStat, NO_EXAMINABLE, departement, begin, end)
      .length +
    noReussitesByResaon(candidatsStat, NO_ADMISSIBLE, departement, begin, end)
      .length +
    noReussitesByResaon(candidatsStat, CANCELED, departement, begin, end)
      .length +
    noReussitesByResaon(
      archivedCandidatsStat,
      NO_EXAMINABLE,
      departement,
      begin,
      end,
    ).length +
    noReussitesByResaon(
      archivedCandidatsStat,
      NO_ADMISSIBLE,
      departement,
      begin,
      end,
    ).length +
    noReussitesByResaon(
      archivedCandidatsStat,
      CANCELED,
      departement,
      begin,
      end,
    ).length
  )
}

const noReussitesByResaon = (
  arrayCandidat,
  reason,
  departement,
  begin,
  end,
) => {
  return arrayCandidat
    .map(candidat =>
      candidat.noReussites.filter(
        noReussite =>
          noReussite.reason === reason &&
          candidat.places
            .filter(
              el =>
                getFrenchLuxonFromISO(el.date) >= begin &&
                getFrenchLuxonFromISO(el.date) <= end,
            )
            .find(({ date, archiveReason, centre }) => {
              const datePlace = getFrenchLuxonFromISO(date)
              const dateNoReussite = getFrenchLuxonFromISO(noReussite.date)
              return (
                datePlace.hasSame(dateNoReussite, 'day') &&
                archiveReason === REASON_EXAM_FAILED &&
                (!departement || centre.departement === departement)
              )
            }) !== undefined,
      ),
    )
    .flat()
}

export const createCandidatsForStat = async () => {
  await Promise.all(
    [centre1, centre2, centre3].map(
      ({ nom, label, adresse, lon, lat, departement }) =>
        createCentre(nom, label, adresse, lon, lat, departement),
    ),
  )
  await createInspecteur(inspecteur1)
  return Promise.all([
    ...candidatsStat.map(createOneCandidatForStat),
    ...archivedCandidatsStat.map(createArchivedCandidatForStat),
  ])
}

const bookedAt = nowLuxon.toJSDate()

const centreTest = {
  departement: '92',
  nom: 'CENTRE 99',
  label: "Centre d'examen 2",
  adresse: '2 Avenue test, Ville test 2, FR, 93420',
  lon: 47,
  lat: 3.5,
}

const candidatForStatsPlace = {
  codeNeph: '123456789993',
  nomNaissance: 'nom à tester 92',
  prenom: 'prénom à tester',
  email: 'test99.testbookedAt1@test.com',
  portable: '0612345678',
  adresse: '10 Rue Oberkampf 92100 Paris',
  dateReussiteETG: nowLuxon.plus({ year: -1 }),
  departement: '92',
}

const inspecteurTestForStatsPlace = {
  nom: 'Mulder-test',
  prenom: 'Fox',
  matricule: '04710111166',
  email: 'fox.mulder.bookedAt1@x-files.com',
  departement: '92',
}

export const createStatsForPlacesExam = async () => {
  const { nom, label, adresse, lon, lat, departement } = centreTest
  const createdCentre = await createCentre(
    nom,
    label,
    adresse,
    lon,
    lat,
    departement,
  )

  const createdInspecteur = await createInspecteur(inspecteurTestForStatsPlace)

  const placeCreated = await createPlace({
    date: commonBasePlaceDateTime.toISO(),
    centre: createdCentre._id,
    inspecteur: createdInspecteur._id,
  })

  await createPlace({
    date: commonBasePlaceDateTime.plus({ hours: 1 }).toISO(),
    centre: createdCentre._id,
    inspecteur: createdInspecteur._id,
  })

  const updatedCandidat = await createCandidatAndUpdate(candidatForStatsPlace)
  await bookCandidatOnSelectedPlace(placeCreated, updatedCandidat, bookedAt)
}

const candidatsForStatsRetention = [
  {
    codeNeph: '888856789980',
    nomNaissance: 'nom à tester 92 retention',
    prenom: 'prénom à tester retention',
    email: 'test01.retention92@test.com',
    portable: '0612345678',
    adresse: '10 Rue Oberkampf 92100 Paris',
    dateReussiteETG: nowLuxon.plus({ year: -1 }),
    departement: '92',
    canAccessAt: nowLuxon.plus({ days: 15 }),
  },
  {
    codeNeph: '888856789981',
    nomNaissance: 'nom à tester 92 retention',
    prenom: 'prénom à tester retention',
    email: 'test02.retention92@test.com',
    portable: '0612345678',
    adresse: '10 Rue Oberkampf 92100 Paris',
    dateReussiteETG: nowLuxon.plus({ year: -1 }),
    departement: '92',
    canAccessAt: nowLuxon.plus({ days: 15 }),
  },
  {
    codeNeph: '878856789980',
    nomNaissance: 'nom à tester 93 retention',
    prenom: 'prénom à tester retention',
    email: 'test01.retention93@test.com',
    portable: '0612345678',
    adresse: '10 Rue Oberkampf 93100 Paris',
    dateReussiteETG: nowLuxon.plus({ year: -1 }),
    departement: '93',
    canAccessAt: nowLuxon.plus({ days: 15 }),
  },
  {
    codeNeph: '878856789981',
    nomNaissance: 'nom à tester 93 retention',
    prenom: 'prénom à tester retention',
    email: 'test02.retention93@test.com',
    portable: '0612345678',
    adresse: '10 Rue Oberkampf 93100 Paris',
    dateReussiteETG: nowLuxon.plus({ year: -1 }),
    departement: '93',
    canAccessAt: nowLuxon.plus({ days: 15 }),
  },
  {
    codeNeph: '858856789980',
    nomNaissance: 'nom à tester 94 retention',
    prenom: 'prénom à tester retention',
    email: 'test01.retention94@test.com',
    portable: '0612345678',
    adresse: '10 Rue Oberkampf 942100 Paris',
    dateReussiteETG: nowLuxon.plus({ year: -1 }),
    departement: '94',
    canAccessAt: nowLuxon.plus({ days: 25 }),
  },
  {
    codeNeph: '858856789981',
    nomNaissance: 'nom à tester 94 retention',
    prenom: 'prénom à tester retention',
    email: 'test02.retention94@test.com',
    portable: '0612345678',
    adresse: '10 Rue Oberkampf 94100 Paris',
    dateReussiteETG: nowLuxon.plus({ year: -1 }),
    departement: '94',
    canAccessAt: nowLuxon.plus({ days: 19 }),
  },
]

export const createCandidatLeaveRetentionArea = async (canAccessAt = null) => {
  const result = await Promise.all(
    candidatsForStatsRetention.map(el =>
      createCandidatAndUpdate(el, canAccessAt || el.canAccessAt),
    ),
  )
  return result
}

const generateFakeEmail = () => {
  const chars = 'abcdefghijklmnopqrstuvwxyz1234567890'
  let string = ''
  for (let idx = 0; idx < 20; idx++) {
    string += chars[Math.floor(Math.random() * chars.length)]
  }
  return string + 'onepiecesaroxxe' + '@shinsekai.com'
}

const generateFakeLastName = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
  let string = ''
  for (let idx = 0; idx < 30; idx++) {
    string += chars[Math.floor(Math.random() * chars.length)]
  }
  return string + 'Monkey-D-Luffy'
}

export const createCandidatsForCountRetentionByWeek = async (
  numberOfCandidats,
  departement,
) => {
  if (!numberOfCandidats) {
    return []
  }
  const randomNeph = () =>
    Math.floor(Math.random() * 999999999999 + 100000000000)
  const luxonDateObject = () => getFrenchLuxon()

  const ArrayOfCandidats = Array(numberOfCandidats)
    .fill(true)
    .map(async (el, index) => {
      const candidat = {
        codeNeph: randomNeph(),
        nomNaissance: generateFakeLastName(),
        prenom: 'Sanji',
        email: generateFakeEmail(),
        portable: '0612345678',
        departement: departement || '93',
        dateReussiteETG: luxonDateObject().plus({ year: -1 }),
        isValidatedByAurige: true,
        isValidatedEmail: true,
        canAccessAt: luxonDateObject()
          .plus({ weeks: index })
          .startOf('day'),
      }
      return createCandidatAndUpdate(candidat, candidat.canAccessAt)
    })
  return Promise.all(ArrayOfCandidats)
}

export const deleteCandidatsForCountRetentionByWeek = candidatsToDelete => {
  return Promise.all(
    candidatsToDelete.map(candidat => {
      return Candidat.findByIdAndDelete(candidat._id)
    }),
  )
}
