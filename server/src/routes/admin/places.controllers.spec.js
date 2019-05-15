import request from 'supertest'
import express from 'express'
import bodyParser from 'body-parser'
import fs from 'fs'
import path from 'path'
import util from 'util'
import { importPlaces } from './places.controllers'

jest.mock('../../util/logger')

const readFileAsPromise = util.promisify(fs.readFile)

const { connect, disconnect } = require('../../mongo-connection')

let app

describe('Admin controller', () => {
  beforeAll(async () => {
    const mongoConnection = connect()
    const filePromise = readFileAsPromise(
      path.resolve(__dirname, './business', '__tests__', 'places-test.csv')
    )
    const [file] = await Promise.all([filePromise, mongoConnection])
    file.name = 'filename'
    app = express()
    app.use(bodyParser.json({ limit: '20mb' }))
    app.use(bodyParser.urlencoded({ limit: '20mb', extended: false }))
    app.use((req, res, next) => {
      req.files = {
        file: {
          name: 'filename',
          data: file,
          mimetype: 'text/csv',
        },
      }
      next()
    })

    app.use(importPlaces)
  })

  afterAll(async () => {
    await disconnect()
    await app.close()
  })

  it('Should response 200 with user infos', async () => {
    const { body } = await request(app)
      .post('')
      .send({ departement: '93' })
      .set('Accept', 'application/json')
      .expect('Content-Type', 'application/json; charset=utf-8')
      .expect(200)

    expect(body.message).toContain('a été traité')
    expect(body.success).toBe(true)
  })

  it('Should response 500 with error without departement', async () => {
    const { body } = await request(app)
      .post('')
      .send({})
      .set('Accept', 'application/json')
      .expect('Content-Type', 'application/json; charset=utf-8')
      .expect(500)

    expect(body.message).toContain('DEPARTEMENT_IS_MANDATORY')
    expect(body.success).toBe(false)
  })
})
