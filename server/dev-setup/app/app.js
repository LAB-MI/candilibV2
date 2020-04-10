import express from 'express'

import { createCandidat, deleteCandidat, findCandidatById } from 'models/candidat/candidat.queries'
const app = express()

export const apiPrefix = '/api/dev-setup'
const router = express.Router()

router.post('/candidats', async (req, res) => {
  const {
    adresse,
    codeNeph,
    email,
    emailValidationHash,
    isValidatedEmail,
    nomNaissance,
    portable,
    prenom,
    departement,
  } = req.body
  try {
    const candidat = await createCandidat({
      adresse,
      codeNeph,
      email,
      emailValidationHash,
      isValidatedEmail,
      nomNaissance,
      portable,
      prenom,
      departement,
    })
    return res.json(candidat)
  } catch (err) {
    res.status(500).send(err)
  }
})
router.delete('/candidats/:id', async (req, res) => {
  const id = req.params
  const candidat = await findCandidatById(id)
  await deleteCandidat(candidat, 'DEV-SETUP')
  return res.status(200).send(true)
})

app.use(apiPrefix, router)

export default app
