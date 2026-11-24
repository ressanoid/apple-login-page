import {
  SESSION_COOKIE,
  getCookie,
  json,
  normalizeEmail,
  verifySessionToken,
} from '../_lib/session'

export default async function handler(request: Request): Promise<Response> {
  if (request.method !== 'POST') {
    return json({ error: 'Method not allowed' }, { status: 405 })
  }

  let body: { email?: unknown }
  try {
    body = (await request.json()) as { email?: unknown }
  } catch {
    return json({ authenticated: false }, { status: 400 })
  }

  const email = typeof body.email === 'string' ? normalizeEmail(body.email) : ''
  if (!email) {
    return json({ authenticated: false }, { status: 400 })
  }

  const token = getCookie(request, SESSION_COOKIE)
  if (!token) {
    return json({ authenticated: false })
  }

  const sessionEmail = await verifySessionToken(token)
  if (!sessionEmail || sessionEmail !== email) {
    return json({ authenticated: false })
  }

  return json({ authenticated: true, email: sessionEmail })
}
