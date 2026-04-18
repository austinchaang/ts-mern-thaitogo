import request from 'supertest'
import mongoose from 'mongoose'
import app from '../src/app'

beforeAll(async () => {
  await mongoose.connect(process.env.MONGODB_URI!)
}, 30000)

afterAll(async () => {
  await mongoose.connection.close()
}, 30000)

describe('GET /api/keys/paypal', () => {
  it('should return a paypal client ID', async () => {
    const res = await request(app).get('/api/keys/paypal')
    expect(res.status).toBe(200)
    expect(res.body).toHaveProperty('clientId')
  })

  it('should be publicly accessible without a token', async () => {
    const res = await request(app).get('/api/keys/paypal')
    expect(res.status).toBe(200)
  })

  it("should return sandbox fallback 'sb' when PAYPAL_CLIENT_ID is not set", async () => {
    const original = process.env.PAYPAL_CLIENT_ID
    delete process.env.PAYPAL_CLIENT_ID
    const res = await request(app).get('/api/keys/paypal')
    process.env.PAYPAL_CLIENT_ID = original
    expect(res.status).toBe(200)
    expect(res.body.clientId).toBe('sb')
  })
})

describe('GET /api/keys/paypal - Branch Coverage', () => {
  it('should return the real client ID when PAYPAL_CLIENT_ID is set', async () => {
    const original = process.env.PAYPAL_CLIENT_ID
    process.env.PAYPAL_CLIENT_ID = 'test-client-id-123'
    const res = await request(app).get('/api/keys/paypal')
    process.env.PAYPAL_CLIENT_ID = original
    expect(res.status).toBe(200)
    expect(res.body.clientId).toBe('test-client-id-123')
  })
})
