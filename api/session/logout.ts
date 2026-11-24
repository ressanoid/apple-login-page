import { clearSessionCookie, json } from '../_lib/session'

export default async function handler(request: Request): Promise<Response> {
  if (request.method !== 'POST') {
    return json({ error: 'Method not allowed' }, { status: 405 })
  }

  return json(
    { ok: true },
    {
      headers: {
        'Set-Cookie': clearSessionCookie(),
      },
    },
  )
}
