import express from 'express'
import { start, status, stop } from './scheduler-controllers'

const router = express.Router()

router.post('/scheduler/start', start)
router.post('/scheduler/stop', stop)
router.get('/scheduler/status', status)

export default router
