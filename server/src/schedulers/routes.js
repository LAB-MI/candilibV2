import express from 'express'
import { techLogger } from '../util'

const router = express.Router()

router.post('/setInformations', async function setInformations(req, res) {
  const { forwradedFor, clientId, userId } = req.body
  const connexionLink = `forwradedFor=${forwradedFor.split(',')[0]}&client=${clientId}`
  techLogger.info({ section: 'setInformations Sdl', connexionLink })

  res.send({
    success: true,
    message: 'setInformations OK',
  })
})


router.post('/verifyInformations', async function verifyInformations(req, res) {
  const { forwradedFor, clientId, userId } = req.body
  const connexionLink = `forwradedFor=${forwradedFor.split(',')[0]}&client=${clientId}`

  techLogger.info({ section: 'verifyInformations Sdl', connexionLink })

  res.send({
    success: true,
  })
})

export default router