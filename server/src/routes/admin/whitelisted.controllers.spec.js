import request from 'supertest'
import express from 'express'
import bodyParser from 'body-parser'

import { connect, disconnect } from '../../mongo-connection'

import { isWhitelisted, getWhitelisted } from './whitelisted.controllers'
import { createWhitelisted } from '../../models/whitelisted'

describe('Test get and export candidats', () => {
  const department = '93'
  beforeAll(async () => {
    await connect()
  })

  afterAll(async () => {
    await disconnect()
  })

  describe('get the whitlisted', () => {
    const app = express()
    app.use(bodyParser.json({ limit: '20mb' }))
    app.use(bodyParser.urlencoded({ limit: '20mb', extended: false }))
    app.use(getWhitelisted)
    app.use((req, res) => res.json({}))

    const listWhitelists = [
      { email: 'test93@test.test', department: '93' },
      { email: 'test93_1@test.test', department: '93' },
      { email: 'test92@test.test', department: '92' },
      { email: 'test94@test.test', department: '94' },
    ]
    let createdWhitelisteds
    beforeAll(async () => {
      createdWhitelisteds = await Promise.all(
        listWhitelists.map(({ email, department }) =>
          createWhitelisted(email, department)
        )
      )
    })
    afterAll(async () => {
      await Promise.all(
        createdWhitelisteds.map(whitelisted => whitelisted.remove())
      )
    })

    it('Should have 200 to get 2 whitelisted of 93', async () => {
      const departement = '93'
      const { body } = await request(app)
        .get(`?departement=${departement}`)
        .set('Accept', 'application/json')
        .expect(200)
      expect(body).toBeDefined()
      expect(body).toHaveLength(2)
      body.forEach(element => {
        expect(element).toMatch(/test93.{0,2}@test.test/)
      })
    })
    it('Should have 200 to get 0 whitelisted of 95', async () => {
      const departement = '95'
      const { body } = await request(app)
        .get(`?departement=${departement}`)
        .set('Accept', 'application/json')
        .expect(200)
      expect(body).toBeDefined()
      expect(body).toHaveLength(0)
    })
  })

  describe('check email in whitelist', () => {
    const app = express()
    app.use(bodyParser.json({ limit: '20mb' }))
    app.use(bodyParser.urlencoded({ limit: '20mb', extended: false }))
    app.use(isWhitelisted)
    app.use((req, res) => res.json({}))

    let createdWhitelisted
    beforeAll(async () => {
      createdWhitelisted = await createWhitelisted('TEst@Gmail.cOm', department)
    })

    afterAll(async () => {
      await createdWhitelisted.remove()
    })

    it('Should call next middleware', async () => {
      await request(app)
        .post(``)
        .send({
          email: 'test@gmail.com',
          department,
        })
        .set('Accept', 'application/json')
        .expect(200)
    })

    it('Should call next middleware', async () => {
      await request(app)
        .post(``)
        .send({
          email: 'test@gMail.com',
          department,
        })
        .set('Accept', 'application/json')
        .expect(200)
    })

    it('Should call next middleware', async () => {
      await request(app)
        .post(``)
        .send({
          email: 'TEST@GMAIL.COM',
          department,
        })
        .set('Accept', 'application/json')
        .expect(200)
    })
  })
})
