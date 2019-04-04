import request from 'supertest'
import express from 'express'
import bodyParser from 'body-parser'

import { connect, disconnect } from '../../mongo-connection'

import { isWhitelisted } from './whitelisted.controllers'
import { createWhitelisted } from '../../models/whitelisted'

const app = express()
app.use(bodyParser.json({ limit: '20mb' }))
app.use(bodyParser.urlencoded({ limit: '20mb', extended: false }))
app.use(isWhitelisted)
app.use((req, res) => res.json({}))

describe('Test get and export candidats', () => {
  beforeAll(async () => {
    createWhitelisted('TEst@Gmail.cOm')
    await connect()
  })

  afterAll(async () => {
    await disconnect()
  })

  it('Should call next middleware', async () => {
    await request(app)
      .post(``)
      .send({
        email: 'test@gmail.com',
      })
      .set('Accept', 'application/json')
      .expect(200)
  })

  it('Should call next middleware', async () => {
    await request(app)
      .post(``)
      .send({
        email: 'test@gMail.com',
      })
      .set('Accept', 'application/json')
      .expect(200)
  })

  it('Should call next middleware', async () => {
    await request(app)
      .post(``)
      .send({
        email: 'TEST@GMAIL.COM',
      })
      .set('Accept', 'application/json')
      .expect(200)
  })
})
