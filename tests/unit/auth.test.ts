import {
  hashPassword,
  verifyPassword,
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
} from '@/lib/auth'

// Mock environment variables
jest.mock('process', () => ({
  env: {
    JWT_SECRET: 'test-jwt-secret-min-32-characters',
    JWT_REFRESH_SECRET: 'test-jwt-refresh-secret-min-32-characters',
  },
}))

describe('Auth', () => {
  describe('Password hashing', () => {
    it('should hash password correctly', async () => {
      const password = 'testpassword123'
      const hashedPassword = await hashPassword(password)
      
      expect(hashedPassword).not.toBe(password)
      expect(hashedPassword).toHaveLength(60) // bcrypt hash length
    })

    it('should verify password correctly', async () => {
      const password = 'testpassword123'
      const hashedPassword = await hashPassword(password)
      
      const isValid = await verifyPassword(password, hashedPassword)
      expect(isValid).toBe(true)
      
      const isInvalid = await verifyPassword('wrongpassword', hashedPassword)
      expect(isInvalid).toBe(false)
    })
  })

  describe('JWT tokens', () => {
    const mockPayload = {
      userId: 'user123',
      email: 'test@example.com',
      role: 'CUSTOMER' as const,
    }

    it('should generate and verify access token', () => {
      const token = generateAccessToken(mockPayload)
      expect(token).toBeTruthy()
      
      const decoded = verifyAccessToken(token)
      expect(decoded.userId).toBe(mockPayload.userId)
      expect(decoded.email).toBe(mockPayload.email)
      expect(decoded.role).toBe(mockPayload.role)
    })

    it('should generate and verify refresh token', () => {
      const token = generateRefreshToken(mockPayload.userId)
      expect(token).toBeTruthy()
      
      const decoded = verifyRefreshToken(token)
      expect(decoded.userId).toBe(mockPayload.userId)
    })

    it('should throw error for invalid access token', () => {
      expect(() => {
        verifyAccessToken('invalid-token')
      }).toThrow()
    })

    it('should throw error for invalid refresh token', () => {
      expect(() => {
        verifyRefreshToken('invalid-token')
      }).toThrow()
    })
  })
})


