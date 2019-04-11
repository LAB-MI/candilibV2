export const toAurigeJsonBuffer = candidatTest => {
  const {
    codeNeph,
    nomNaissance,
    nomUsage,
    prenom,
    email,
    dateReussiteETG,
    dateDernierEchecPratique,
    reussitePratique,
    candidatExistant,
  } = candidatTest

  return JSON.stringify([
    {
      codeNeph,
      nomNaissance,
      nomUsage,
      prenom,
      email,
      dateReussiteETG,
      dateDernierEchecPratique,
      reussitePratique,
      candidatExistant,
    },
  ])
}
