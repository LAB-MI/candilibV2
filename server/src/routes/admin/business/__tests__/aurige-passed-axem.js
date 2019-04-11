// TODO: A merger avec celui de la branch #260
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
