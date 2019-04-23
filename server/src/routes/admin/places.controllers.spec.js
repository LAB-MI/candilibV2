// import request from 'supertest'
// import express from 'express'
// import fs from 'fs'
// import path from 'path'
// import util from 'util'

// jest.mock('../../../util/logger')

// const readFileAsPromise = util.promisify(fs.readFile)
// import { importPlaces } from './places.controllers'
// import { createUser } from '../../models/user'

// const { connect, disconnect } = require('../../mongo-connection')
// const { apiPrefix } = require('../../app')

// let app
// let admin

// const email = 'test@example.com'
// const password = 'S3cr3757uff!'

// describe('Admin controller', () => {
//   beforeAll(async () => {
//     await connect()
//     admin = await createUser(email, password)
//     app = express()
//     app.use((req, res, next) => {
//       req.userId = admin._id
//       req.files =
//       next()
//     })

//     const file = await readFileAsPromise(
//       path.resolve(__dirname, './buisness', '__tests__', 'places-test.csv')
//     )

//     const data = new FormData()
//     data.append('file', file)
//     app.use(importPlaces)
//   })

//   afterAll(async () => {
//     await disconnect()
//     await app.close()
//   })

//   it('Should response 200 with user infos', async () => {
//     const { body } = await request(app)
//       .get(`${apiPrefix}/admin/me`)
//       .set('Accept', 'application/json')
//       .expect('Content-Type', 'application/json; charset=utf-8')
//       .expect(200)

//     expect(body).toHaveProperty('email', email)
//   })
// })
