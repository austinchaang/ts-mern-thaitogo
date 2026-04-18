import request from 'supertest'
import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'
import app from '../src/app'
import { UserModel } from '../src/models/userModel'
import { ProductModel } from '../src/models/productModel'

const regularEmail = `seed_user_${Date.now()}@example.com`
const adminEmail = `seed_admin_${Date.now()}@example.com`
const password = 'password123'

let regularToken: string
let adminToken: string

beforeAll(async () => {
  await mongoose.connect(process.env.MONGODB_URI!)

  // Create regular user via signup
  const regularSignup = await request(app)
    .post('/api/users/signup')
    .send({ name: 'Regular User', email: regularEmail, password })
  regularToken = regularSignup.body.token

  // Signup doesn't allow isAdmin — create admin directly in DB then sign in
  await UserModel.create({
    name: 'Admin User',
    email: adminEmail,
    password: bcrypt.hashSync(password),
    isAdmin: true,
  })
  const adminSignin = await request(app)
    .post('/api/users/signin')
    .send({ email: adminEmail, password })
  adminToken = adminSignin.body.token
}, 30000)

afterAll(async () => {
  await mongoose.connection.collection('users').deleteMany({
    email: { $in: [regularEmail, adminEmail] },
  })
  await mongoose.connection.close()
}, 30000)

describe('GET /api/seed - Access Control', () => {
  it('should reject unauthenticated requests', async () => {
    const res = await request(app).get('/api/seed')
    expect(res.status).toBe(401)
  })

  it('should reject non-admin authenticated requests', async () => {
    const res = await request(app)
      .get('/api/seed')
      .set('Authorization', `Bearer ${regularToken}`)
    expect(res.status).toBe(403)
  })

  it('should allow admin users to seed the database', async () => {
    const res = await request(app)
      .get('/api/seed')
      .set('Authorization', `Bearer ${adminToken}`)
    expect(res.status).toBe(200)
  })
})

describe('GET /api/seed - Error Handling', () => {
  it('should return 500 when a database operation fails', async () => {
    jest.spyOn(ProductModel, 'deleteMany').mockRejectedValueOnce(new Error('DB error'))
    const res = await request(app)
      .get('/api/seed')
      .set('Authorization', `Bearer ${adminToken}`)
    jest.restoreAllMocks()
    expect(res.status).toBe(500)
  })
})

describe('Security - isAdmin middleware', () => {
  it('should return 403 when non-admin tries to access admin route', async () => {
    const res = await request(app)
      .get('/api/seed')
      .set('Authorization', `Bearer ${regularToken}`)
    expect(res.status).toBe(403)
  })

  it('should allow admin to access protected route', async () => {
    const res = await request(app)
      .get('/api/seed')
      .set('Authorization', `Bearer ${adminToken}`)
    expect(res.status).toBe(200)
  })
})
