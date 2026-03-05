/**
 * Decode the payload from a Google OAuth JWT credential.
 * JWTs have the format: header.payload.signature
 * We decode the base64url-encoded payload to extract user info.
 */
export function decodeToken(credential) {
  const parts = credential.split('.')
  if (parts.length !== 3) {
    throw new Error('Invalid token format')
  }

  const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/')
  const json = atob(base64)
  return JSON.parse(json)
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

/**
 * Handle the credential response from Google Identity Services.
 * Decodes the JWT, extracts user info, saves to localStorage, and fetches role from backend.
 * Returns the user object on success, or null on failure.
 */
export async function handleCredentialResponse(response) {
  try {
    const payload = decodeToken(response.credential)
    const user = {
      email: payload.email,
      name: payload.name,
      sub: payload.sub,
      picture: payload.picture || null,
      role: 'user',
    }
    localStorage.setItem('user', JSON.stringify(user))
    localStorage.setItem('user_credential', response.credential)

    // Upsert user in backend and fetch their role
    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credential: response.credential }),
      })
      if (res.ok) {
        const data = await res.json()
        user.role = data.role
        localStorage.setItem('user', JSON.stringify(user))
      }
    } catch (backendErr) {
      console.warn('Could not fetch role from backend:', backendErr)
    }

    return user
  } catch (err) {
    console.error('Login failed: invalid credential', err)
    return null
  }
}

/**
 * Sign out the current user.
 * Clears user data from localStorage.
 */
export function signOut() {
  localStorage.removeItem('user')
  localStorage.removeItem('user_credential')
}

/**
 * Get the stored Google credential JWT for authenticated API calls.
 */
export function getCredential() {
  return localStorage.getItem('user_credential')
}

/**
 * Get the currently logged-in user from localStorage.
 * Returns the user object, or null if not logged in.
 */
export function getCurrentUser() {
  const data = localStorage.getItem('user')
  if (!data) return null
  try {
    return JSON.parse(data)
  } catch {
    return null
  }
}
