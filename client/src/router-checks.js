import {
  ADMIN_TOKEN_STORAGE_KEY,
  CANDIDAT_TOKEN_STORAGE_KEY,
} from '@/constants'

import store, {
  CHECK_ADMIN_TOKEN,
  CHECK_CANDIDAT_TOKEN,
  SIGNED_IN_AS_ADMIN,
  SIGNED_IN_AS_CANDIDAT,
} from '@/store'

export async function requireCandidatAuth (to, from, next) {
  const token = to.query.token || localStorage.getItem(CANDIDAT_TOKEN_STORAGE_KEY)
  const signupRoute = {
    name: 'candidat-presignup',
    query: { nextPath: to.fullPath },
  }
  if (!token) {
    next(signupRoute)
    return
  }
  await store.dispatch(CHECK_CANDIDAT_TOKEN, token)
  if (store.state.auth.statusCandidat !== SIGNED_IN_AS_CANDIDAT) {
    next(signupRoute)
    return
  }
  delete to.query.token
  next()
}

export async function requireAdminAuth (to, from, next) {
  const token = localStorage.getItem(ADMIN_TOKEN_STORAGE_KEY)
  const signinRoute = {
    name: 'admin-login',
    query: { nextPath: to.fullPath },
  }
  if (!token) {
    next(signinRoute)
    return
  }
  await store.dispatch(CHECK_ADMIN_TOKEN, token)
  if (store.state.auth.statusAdmin !== SIGNED_IN_AS_ADMIN) {
    next(signinRoute)
    return
  }
  next()
}

export async function checkAdminToken (to, from, next) {
  const token = localStorage.getItem(ADMIN_TOKEN_STORAGE_KEY)
  if (!token) {
    next()
    return
  }

  await store.dispatch(CHECK_ADMIN_TOKEN, token)
  if (store.state.auth.statusAdmin === SIGNED_IN_AS_ADMIN) {
    next({ name: 'admin' })
    return
  }
  next()
}

export async function checkCandidatToken (to, from, next) {
  const token = to.query.token || localStorage.getItem(CANDIDAT_TOKEN_STORAGE_KEY)
  if (!token) {
    next()
    return
  }
  await store.dispatch(CHECK_CANDIDAT_TOKEN, token)
  if (store.state.auth.statusCandidat === SIGNED_IN_AS_CANDIDAT) {
    next({ name: 'candidat-home' })
  }
}

export async function checkReservation (to, from, next) {
  if (store.state.reservation.booked) {
    next({ name: 'confirm-selection', props: { isRecap: true } })
    return
  }
  next()
}
