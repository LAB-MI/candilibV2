import store, {
  CHECK_ADMIN_TOKEN,
  CHECK_CANDIDAT_TOKEN,
  SIGNED_IN_AS_ADMIN,
  SIGNED_IN_AS_CANDIDAT,
} from '@/store'

export async function requireCandidatAuth (to, from, next) {
  const token = to.query.token || localStorage.getItem('token')
  const signupRoute = {
    name: 'candidat-signup',
    query: { nextPath: to.fullPath },
  }
  if (!token) {
    next(signupRoute)
    return
  }
  await store.dispatch(CHECK_CANDIDAT_TOKEN, token)
  if (store.state.auth.status !== SIGNED_IN_AS_CANDIDAT) {
    next(signupRoute)
    return
  }
  delete to.query.token
  next()
}

export async function requireAdminAuth (to, from, next) {
  const token = localStorage.getItem('token')
  const signinRoute = {
    name: 'admin-login',
    query: { nextPath: to.fullPath },
  }
  if (!token) {
    next(signinRoute)
  }
  await store.dispatch(CHECK_ADMIN_TOKEN, token)
  if (store.state.auth.status !== SIGNED_IN_AS_ADMIN) {
    next(signinRoute)
    return
  }
  next()
}

export async function checkAdminToken (to, from, next) {
  const token = localStorage.getItem('token')
  if (!token) {
    next()
    return
  }
  await store.dispatch(CHECK_ADMIN_TOKEN, token)
  if (store.state.auth.status === SIGNED_IN_AS_ADMIN) {
    next({ name: 'admin' })
  }
}

export async function checkCandidatToken (to, from, next) {
  const token = to.query.token || localStorage.getItem('token')
  if (!token) {
    next()
    return
  }
  await store.dispatch(CHECK_CANDIDAT_TOKEN, token)
  if (store.state.auth.status === SIGNED_IN_AS_CANDIDAT) {
    next({ name: 'candidat' })
  }
}
