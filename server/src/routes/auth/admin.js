import express from 'express'

const router = express.Router()

router.post('/login', (req, res) => {
  const token = ''
  res.json({ auth: true, token })
})

export default router
