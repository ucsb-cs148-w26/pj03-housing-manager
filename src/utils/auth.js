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

/**
 * Handle the credential response from Google Identity Services.
 * Decodes the JWT, extracts user info, and saves to localStorage.
 * Returns the user object on success, or null on failure.
 */
export function handleCredentialResponse(response) {
  try {
    const payload = decodeToken(response.credential)
    const user = {
      email: payload.email,
      name: payload.name,
      sub: payload.sub,
      picture: payload.picture || null,
    }
    localStorage.setItem('user', JSON.stringify(user))
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
