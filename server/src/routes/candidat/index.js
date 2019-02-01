import express from 'express'
import { verifyToken } from '../middlewares'

export { preSignup } from './candidat.controllers'

const router = express.Router()

router.use(verifyToken)

export default router
