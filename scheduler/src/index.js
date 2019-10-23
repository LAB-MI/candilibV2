import dotenv from 'dotenv'
import jobs from './job-list'
import startScheduler from './automate.js'

dotenv.config()
startScheduler(jobs)
