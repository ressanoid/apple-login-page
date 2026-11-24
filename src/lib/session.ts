function normalizeEmail(email: string) {
  return email.trim().toLowerCase()
}

async function parseResponse(response: Response) {
  let data: unknown = null
  try {
    data = await response.json()
  } catch {
    data = null
  }
  return data
}

export async function checkSessionForEmail(email: string): Promise<boolean> {
  const response = await fetch('/api/session/check', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ email: normalizeEmail(email) }),
  })

  if (!response.ok) return false

  const data = (await parseResponse(response)) as { authenticated?: boolean } | null
  return data?.authenticated === true
}

export async function login(email: string, password: string): Promise<void> {
  const response = await fetch('/api/session/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ email: normalizeEmail(email), password }),
  })

  if (!response.ok) {
    const data = (await parseResponse(response)) as { error?: string } | null
    throw new Error(data?.error ?? 'Could not save your details. Please try again.')
  }
}

export async function logout(): Promise<void> {
  await fetch('/api/session/logout', {
    method: 'POST',
    credentials: 'include',
  }).catch(() => undefined)
}
