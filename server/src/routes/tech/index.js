import express from 'express'
import { verifyTechAdminLevel } from '../admin/middlewares'
import { getAutomateStatus, getJobsAutomate, startAutomate, stopAutomate } from './automate-controller'

const router = express.Router()

router.use(verifyTechAdminLevel())
router.get('/status', getAutomateStatus)
router.post('/start', startAutomate)
router.post('/stop', stopAutomate)
router.get('/jobs', getJobsAutomate)

export default router
