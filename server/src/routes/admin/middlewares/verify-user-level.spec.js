import request from 'supertest'
import express from 'express'
import jwt from 'jsonwebtoken'

import { verifyToken } from '../../middlewares'
import { verifyRepartiteurLevel, verifyAdminLevel } from './verify-user-level'
import { apiPrefix } from '../../../app'
import config from '../../../config'

describe('Verify User level', () => {
  describe('Verify repartiteur level', () => {
    const basicData = {
      email: 'user@example.com',
      level: config.userStatusLevels[config.userStatuses.CANDIDAT],
    }

    const basicToken = jwt.sign(basicData, config.secret, {
      expiresIn: '30s',
    })

    const adminData = {
      email: 'admin@example.com',
      level: config.userStatusLevels[config.userStatuses.REPARTITEUR],
    }

    const adminToken = jwt.sign(adminData, config.secret, {
      expiresIn: '30s',
    })

    const app = express()
    app.use(verifyToken, verifyRepartiteurLevel())
    app.get(apiPrefix, (req, res) => res.json({ ok: true }))

    afterAll(async () => {
      await app.close()
    })

    it('Should respond a 401', async () => {
      // When
      const { body, status } = await request(app)
        .get(apiPrefix)
        .set('Accept', 'application/json')
        .set('Authorization', `Bearer ${basicToken}`)

      // Then
      expect(status).toBe(401)
      expect(body).toHaveProperty('success', false)
      expect(body).toHaveProperty('message', 'Accès interdit')
    })

    it('Should respond a 200', async () => {
      // When
      const { body, status } = await request(app)
        .get(apiPrefix)
        .set('Accept', 'application/json')
        .set('Authorization', `Bearer ${adminToken}`)

      // Then
      expect(status).toBe(200)
      expect(body).toHaveProperty('ok', true)
    })
  })

  describe('Verify admin level', () => {
    const basicData = {
      email: 'user@example.com',
      level: config.userStatusLevels[config.userStatuses.CANDIDAT],
    }

    const basicToken = jwt.sign(basicData, config.secret, {
      expiresIn: '30s',
    })

    const adminData = {
      email: 'admin@example.com',
      level: config.userStatusLevels[config.userStatuses.DELEGUE],
    }

    const adminToken = jwt.sign(adminData, config.secret, {
      expiresIn: '30s',
    })

    const techData = {
      email: 'tech@example.com',
      level: config.userStatusLevels[config.userStatuses.ADMIN],
    }
    const techToken = jwt.sign(techData, config.secret, {
      expiresIn: '30s',
    })

    const app = express()
    app.use(verifyToken, verifyAdminLevel())
    app.get(apiPrefix, (req, res) => res.json({ ok: true }))

    afterAll(async () => {
      await app.close()
    })

    it('Should respond a 401 for basic ', async () => {
      // When
      const { body, status } = await request(app)
        .get(apiPrefix)
        .set('Accept', 'application/json')
        .set('Authorization', `Bearer ${basicToken}`)

      // Then
      expect(status).toBe(401)
      expect(body).toHaveProperty('success', false)
      expect(body).toHaveProperty('message', 'Accès interdit')
    })

    it('Should respond a 401  for admin ', async () => {
      // When
      const { body, status } = await request(app)
        .get(apiPrefix)
        .set('Accept', 'application/json')
        .set('Authorization', `Bearer ${adminToken}`)

      // Then
      expect(status).toBe(401)
      expect(body).toHaveProperty('success', false)
      expect(body).toHaveProperty('message', 'Accès interdit')
    })

    it('Should respond a 200', async () => {
      // When
      const { body, status } = await request(app)
        .get(apiPrefix)
        .set('Accept', 'application/json')
        .set('Authorization', `Bearer ${techToken}`)

      // Then
      expect(status).toBe(200)
      expect(body).toHaveProperty('ok', true)
    })
  })
})
