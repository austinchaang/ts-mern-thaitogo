import request from 'supertest'
import mongoose from 'mongoose'
import app from '../src/app'

// Generates a unique email every time tests run (e.g. test_1712345678@example.com). 
// This prevents conflicts if the same email already exists in the database from a previous run.
const testEmail = `test_${Date.now()}@example.com`
const caseTestEmail = `casetest_${Date.now()}@example.com`

// Runs once before all tests. Connects to your Atlas test database. 
// The 30000 gives it 30 seconds to connect before timing out. 
// beforeAll is a Jest hook — think of it as "setup before the test suite starts".
beforeAll(async () => {
  await mongoose.connect(process.env.MONGODB_URI!)
}, 30000)

// Runs once after all tests finish. 
// Cleans up by deleting the test user we created, then closes the database connection. 
// This keeps your test database clean between runs. afterAll is the "teardown" hook.
afterAll(async () => {
  await mongoose.connection.collection('users').deleteMany({ email: { $in: [testEmail, caseTestEmail] } })
  await mongoose.connection.close()
}, 30000)

// This is a happy path test — it tests the normal expected behavior. 
// It:
// Sends a POST request to /api/users/signup with valid data
// Checks the response status is 200 (success)
// Checks the response body contains a token (JWT)
// Checks the returned email matches what we sent
describe('POST /api/users/signup', () => {
  it('should create a new user and return a token', async () => {
    const res = await request(app)
      .post('/api/users/signup')
      .send({
        name: 'Test User',
        email: testEmail,
        password: 'password123',
      })
    expect(res.status).toBe(200)
    expect(res.body).toHaveProperty('token')
    expect(res.body.email).toBe(testEmail)
  })
})

// Another happy path test. It:
// Signs in with the same user we just created in Test 1
// Checks the response is 200
// Checks a token is returned
describe('POST /api/users/signin', () => {
  it('should sign in and return a token', async () => {
    const res = await request(app)
      .post('/api/users/signin')
      .send({
        email: testEmail,
        password: 'password123',
      })
    expect(res.status).toBe(200)
    expect(res.body).toHaveProperty('token')
  })

// This is a negative test — it tests what happens when something goes wrong. It:

// Tries to sign in with the wrong password
// Checks the response is 401 (Unauthorized)
// Checks the error message is exactly "Invalid email or password"
  it('should return 401 for invalid credentials', async () => {
    const res = await request(app)
      .post('/api/users/signin')
      .send({
        email: testEmail,
        password: 'wrongpassword',
      })
    expect(res.status).toBe(401)
    expect(res.body.message).toBe('Invalid email or password')
  })
})

describe('Security - POST /api/users/signup', () => {
  it('should reject signup with missing email', async () => {
    const res = await request(app)
      .post('/api/users/signup')
      .send({ name: 'Test User', password: 'password123' })
    expect(res.status).toBe(400)
  })

  it('should reject signup with missing password', async () => {
    const res = await request(app)
      .post('/api/users/signup')
      .send({ name: 'Test User', email: 'user@example.com' })
    expect(res.status).toBe(400)
  })

  it('should reject signup with missing name', async () => {
    const res = await request(app)
      .post('/api/users/signup')
      .send({ email: 'user@example.com', password: 'password123' })
    expect(res.status).toBe(400)
  })
})

describe('Security - POST /api/users/signin', () => {
  it('should return same error message for wrong email and wrong password (prevent user enumeration)', async () => {
    const wrongEmailRes = await request(app)
      .post('/api/users/signin')
      .send({ email: 'nonexistent@example.com', password: 'password123' })
    expect(wrongEmailRes.status).toBe(401)

    const wrongPasswordRes = await request(app)
      .post('/api/users/signin')
      .send({ email: testEmail, password: 'wrongpassword' })
    expect(wrongPasswordRes.status).toBe(401)

    expect(wrongEmailRes.body.message).toBe(wrongPasswordRes.body.message)
  })

  it('should reject NoSQL injection attempt', async () => {
    const res = await request(app)
      .post('/api/users/signin')
      .send({ email: { $gt: '' }, password: { $gt: '' } })
    expect(res.status).toBe(401)
  })

  it('should reject empty credentials', async () => {
    const res = await request(app)
      .post('/api/users/signin')
      .send({ email: '', password: '' })
    expect(res.status).toBe(401)
  })
})

describe('Security - Duplicate Email', () => {
  it('should reject signup with an already registered email', async () => {
    const res = await request(app)
      .post('/api/users/signup')
      .send({ name: 'Test User', email: testEmail, password: 'password123' })
    expect(res.status).toBe(400)
  })

  it('should return a descriptive error message for duplicate email', async () => {
    const res = await request(app)
      .post('/api/users/signup')
      .send({ name: 'Test User', email: testEmail, password: 'password123' })
    expect(res.status).toBe(400)
    expect(res.body.message).toMatch(/email already registered/i)
  })
})

describe('Security - Password Strength', () => {
  it('should reject signup with password shorter than 6 characters', async () => {
    const res = await request(app)
      .post('/api/users/signup')
      .send({ name: 'Test User', email: 'user@example.com', password: 'abc' })
    expect(res.status).toBe(400)
  })

  it('should reject signup with empty password string', async () => {
    const res = await request(app)
      .post('/api/users/signup')
      .send({ name: 'Test User', email: 'user@example.com', password: '' })
    expect(res.status).toBe(400)
  })
})

describe('Security - Input Limits', () => {
  it('should reject signup with an extremely long name over 100 characters', async () => {
    const res = await request(app)
      .post('/api/users/signup')
      .send({ name: 'A'.repeat(101), email: 'user@example.com', password: 'password123' })
    expect(res.status).toBe(400)
  })

  it('should reject signup with an extremely long password over 100 characters', async () => {
    const res = await request(app)
      .post('/api/users/signup')
      .send({ name: 'Test User', email: 'user@example.com', password: 'a'.repeat(101) })
    expect(res.status).toBe(400)
  })

  it("should reject signup with an invalid email format like 'notanemail'", async () => {
    const res = await request(app)
      .post('/api/users/signup')
      .send({ name: 'Test User', email: 'notanemail', password: 'password123' })
    expect(res.status).toBe(400)
  })
})

describe('Security - Edge Cases', () => {
  it('should handle completely empty request body on signup', async () => {
    const res = await request(app)
      .post('/api/users/signup')
      .send({})
    expect(res.status).toBe(400)
  })

  it('should handle completely empty request body on signin', async () => {
    const res = await request(app)
      .post('/api/users/signin')
      .send({})
    expect(res.status).toBe(401)
  })

  it('should treat emails as case insensitive so TEST@EXAMPLE.COM and test@example.com are the same user', async () => {
    await request(app)
      .post('/api/users/signup')
      .send({ name: 'Case Test', email: caseTestEmail, password: 'password123' })

    const res = await request(app)
      .post('/api/users/signin')
      .send({ email: caseTestEmail.toUpperCase(), password: 'password123' })
    expect(res.status).toBe(200)
    expect(res.body).toHaveProperty('token')
  })
})

describe('Security - Protected routes', () => {
  it('should reject requests to /api/orders/mine without a token', async () => {
    const res = await request(app).get('/api/orders/mine')
    expect(res.status).toBe(401)
  })

  it('should reject requests to /api/orders/mine with an invalid token', async () => {
    const res = await request(app)
      .get('/api/orders/mine')
      .set('Authorization', 'Bearer faketoken123')
    expect(res.status).toBe(401)
  })

  it('should reject requests to /api/orders/mine with a malformed Authorization header', async () => {
    const res = await request(app)
      .get('/api/orders/mine')
      .set('Authorization', 'notavalidheader')
    expect(res.status).toBe(401)
  })
})