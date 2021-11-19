import express from 'express'
import { start, status, stop } from './scheduler-controllers'
import { getJobs } from './scheduler-job-controllers'

const router = express.Router()

router.post('/scheduler/start', start)
router.post('/scheduler/stop', stop)
router.get('/scheduler/status', status)

router.get('/jobs/:name?', getJobs)

export default router
