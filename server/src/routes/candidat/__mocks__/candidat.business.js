export async function signUpCandidat (candidatData) {
  return {
    success: true,
    message:
      'Votre demande a été prise en compte, veuillez consulter votre messagerie (pensez à vérifier dans vos courriers indésirables).',
    candidat: candidatData,
  }
}

export const getInfoCandidatDepartement = async id => {
  return '93'
}
