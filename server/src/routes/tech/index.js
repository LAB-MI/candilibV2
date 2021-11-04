import express from 'express'
import { verifyAdminLevel } from '../admin/middlewares'
import { getAutomateStatus, startAutomate, stopAutomate } from './automate-controller'

const router = express.Router()

router.use(verifyAdminLevel())
router.get('/status', getAutomateStatus)
router.post('/start', startAutomate)
router.post('/stop', stopAutomate)

export default router
