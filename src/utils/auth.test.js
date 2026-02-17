import { describe, test, expect, beforeEach, vi } from 'vitest'
import { decodeToken, handleCredentialResponse, signOut, getCurrentUser } from './auth'

// Helper: create a mock JWT from a payload object
function mockJWT(payload) {
  const base64 = btoa(JSON.stringify(payload))
  return `header.${base64}.signature`
}

describe('Auth Utilities', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.restoreAllMocks()
  })

  // --- decodeToken ---

  describe('decodeToken', () => {
    test('extracts payload from a valid JWT', () => {
      const payload = { email: 'student@ucsb.edu', name: 'Alex Chen', sub: '123' }
      const token = mockJWT(payload)

      const result = decodeToken(token)

      expect(result.email).toBe('student@ucsb.edu')
      expect(result.name).toBe('Alex Chen')
      expect(result.sub).toBe('123')
    })

    test('throws on token with wrong number of parts', () => {
      expect(() => decodeToken('only-one-part')).toThrow('Invalid token format')
      expect(() => decodeToken('two.parts')).toThrow('Invalid token format')
    })

    test('throws on token with invalid base64 payload', () => {
      expect(() => decodeToken('a.!!!.b')).toThrow()
    })
  })

  // --- handleCredentialResponse ---

  describe('handleCredentialResponse', () => {
    test('saves user to localStorage on valid credential', () => {
      const payload = { email: 'student@ucsb.edu', name: 'Alex Chen', sub: '456' }
      const response = { credential: mockJWT(payload) }

      const user = handleCredentialResponse(response)

      expect(user).toEqual({
        email: 'student@ucsb.edu',
        name: 'Alex Chen',
        sub: '456',
        picture: null,
      })

      const stored = JSON.parse(localStorage.getItem('user'))
      expect(stored.email).toBe('student@ucsb.edu')
    })

    test('saves picture when present in token', () => {
      const payload = { email: 'a@b.com', name: 'A', sub: '1', picture: 'https://img.url/photo.jpg' }
      const response = { credential: mockJWT(payload) }

      const user = handleCredentialResponse(response)

      expect(user.picture).toBe('https://img.url/photo.jpg')
    })

    test('returns null and does not save on malformed token', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      const response = { credential: 'bad-token' }

      const user = handleCredentialResponse(response)

      expect(user).toBeNull()
      expect(localStorage.getItem('user')).toBeNull()
      expect(consoleSpy).toHaveBeenCalled()
    })
  })

  // --- signOut ---

  describe('signOut', () => {
    test('removes user from localStorage', () => {
      localStorage.setItem('user', JSON.stringify({ email: 'test@ucsb.edu' }))

      signOut()

      expect(localStorage.getItem('user')).toBeNull()
    })

    test('does not throw when no user is stored', () => {
      expect(() => signOut()).not.toThrow()
    })
  })

  // --- getCurrentUser ---

  describe('getCurrentUser', () => {
    test('returns user object when logged in', () => {
      const user = { email: 'test@ucsb.edu', name: 'Test', sub: '789' }
      localStorage.setItem('user', JSON.stringify(user))

      expect(getCurrentUser()).toEqual(user)
    })

    test('returns null when no user is stored', () => {
      expect(getCurrentUser()).toBeNull()
    })

    test('returns null when localStorage contains invalid JSON', () => {
      localStorage.setItem('user', 'not-json{{{')

      expect(getCurrentUser()).toBeNull()
    })
  })
})
