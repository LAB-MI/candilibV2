import express from 'express'

export const candidatsExport = express.Router()

candidatsExport.use('/', (req, res) => {
  res.json({ export: 'candidats' })
})
