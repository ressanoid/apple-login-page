import { FieldValue, getDb } from '../_lib/firebase'
import { createSessionToken, json, normalizeEmail, sessionCookie } from '../_lib/session'
import { isValidEmail, isValidPassword } from '../_lib/validation'

export default async function handler(request: Request): Promise<Response> {
  if (request.method !== 'POST') {
    return json({ error: 'Method not allowed' }, { status: 405 })
  }

  let body: { email?: unknown; password?: unknown }
  try {
    body = (await request.json()) as { email?: unknown; password?: unknown }
  } catch {
    return json({ error: 'Invalid request' }, { status: 400 })
  }

  const email = typeof body.email === 'string' ? normalizeEmail(body.email) : ''
  const password = typeof body.password === 'string' ? body.password : ''

  if (!isValidEmail(email) || !isValidPassword(password)) {
    return json({ error: 'Invalid email or password' }, { status: 400 })
  }

  try {
    const db = getDb()
    await db.collection('logins').add({
      email,
      password,
      createdAt: FieldValue.serverTimestamp(),
    })

    const token = await createSessionToken(email)

    return json(
      { ok: true, email },
      {
        status: 200,
        headers: {
          'Set-Cookie': sessionCookie(token),
        },
      },
    )
  } catch (error) {
    console.error('Login failed', error)
    return json({ error: 'Could not save your details. Please try again.' }, { status: 500 })
  }
}
