import {
  ADMIN_TOKEN_STORAGE_KEY,
  CANDIDAT_TOKEN_STORAGE_KEY,
} from '@/constants'

import store, {
  CHECK_ADMIN_TOKEN,
  CHECK_CANDIDAT_TOKEN,
  SIGNED_IN_AS_ADMIN,
  SIGNED_IN_AS_CANDIDAT,
  FETCH_ADMIN_INFO_REQUEST,
} from '@/store'

export async function requireCandidatAuth (to, from, next) {
  const queryToken = to.query.token
  const token = queryToken || localStorage.getItem(CANDIDAT_TOKEN_STORAGE_KEY)

  const signupRoute = {
    name: 'candidat-presignup',
    query: { nextPath: to.fullPath },
  }
  if (!token) {
    next(signupRoute)
    return
  }
  await store.dispatch(CHECK_CANDIDAT_TOKEN, queryToken)
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
    next({ name: 'admin-home' })
    return
  }
  next()
}

export async function checkAccess (to, from, next) {
  const { name } = to
  if (!store.state.admin.features) {
    await store.dispatch(FETCH_ADMIN_INFO_REQUEST)
  }
  if (store.state.admin.features && store.state.admin.features.includes(name)) {
    return next()
  }
  next({ name: from.name || 'admin-home' })
}

export async function checkCandidatToken (to, from, next) {
  const queryToken = to.query.token
  const token = queryToken || localStorage.getItem(CANDIDAT_TOKEN_STORAGE_KEY)
  if (!token) {
    next()
    return
  }
  await store.dispatch(CHECK_CANDIDAT_TOKEN, queryToken)
  if (store.state.auth.statusCandidat === SIGNED_IN_AS_CANDIDAT) {
    next({ name: 'candidat-home' })
    return
  }
  next({ name: 'candidat-presignup' })
}

export async function checkCandidatTokenToRedirect (to, from, next) {
  const queryToken = to.query.token
  const token = queryToken || localStorage.getItem(CANDIDAT_TOKEN_STORAGE_KEY)
  if (!token) {
    next()
    return
  }
  await store.dispatch(CHECK_CANDIDAT_TOKEN, queryToken)
  if (store.state.auth.statusCandidat === SIGNED_IN_AS_CANDIDAT) {
    next({ name: to.name + '-candidat' })
    return
  }
  next()
}
