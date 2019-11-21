import {
  SUBJECT_CONVOCATION,
  SUBJECT_CANCEL_RESA,
} from '../send-message-constants'
import { getConvocationBody } from '../build-mail-convocation'
import { getCancellationBody } from '../build-mail-cancellation'

export function expectMailConvocation (candidat, place) {
  const bodyMail = require('../send-mail').getMail()
  expect(bodyMail).toBeDefined()
  expect(bodyMail).toHaveProperty('to', candidat.email)
  expect(bodyMail).toHaveProperty('subject', SUBJECT_CONVOCATION)
  place.candidat = candidat
  expect(bodyMail).toHaveProperty('html', getConvocationBody(place))
}

export function expectMailCancelBooking (candidat, place) {
  const bodyMail = require('../send-mail').getMail()
  expect(bodyMail).toBeDefined()
  expect(bodyMail).toHaveProperty('to', candidat.email)
  expect(bodyMail).toHaveProperty('subject', SUBJECT_CANCEL_RESA)

  expect(bodyMail).toHaveProperty('html', getCancellationBody(place, candidat))
}
