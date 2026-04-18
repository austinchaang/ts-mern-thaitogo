import request from 'supertest'
import mongoose from 'mongoose'
import app from '../src/app'
import { OrderModel } from '../src/models/orderModel'

const userAEmail = `orders_usera_${Date.now()}@example.com`
const userBEmail = `orders_userb_${Date.now()}@example.com`
const password = 'password123'

let tokenA: string
let tokenB: string
let userAId: string
let userBId: string
let orderAId: string

const sampleOrder = {
  orderItems: [{ name: 'Pad Thai', quantity: '2', image: 0, price: 12.99 }],
  shippingAddress: {
    fullName: 'User A',
    address: '123 Main St',
    city: 'Bangkok',
    postalCode: '10110',
    country: 'Thailand',
  },
  paymentMethod: 'PayPal',
  itemsPrice: 25.98,
  shippingPrice: 5.0,
  taxPrice: 2.6,
  totalPrice: 33.58,
}

beforeAll(async () => {
  await mongoose.connect(process.env.MONGODB_URI!)

  const signupA = await request(app)
    .post('/api/users/signup')
    .send({ name: 'User A', email: userAEmail, password })
  tokenA = signupA.body.token
  userAId = signupA.body._id

  const signupB = await request(app)
    .post('/api/users/signup')
    .send({ name: 'User B', email: userBEmail, password })
  tokenB = signupB.body.token
  userBId = signupB.body._id

  // Create an order as user A for the ownership test
  const orderRes = await request(app)
    .post('/api/orders')
    .set('Authorization', `Bearer ${tokenA}`)
    .send(sampleOrder)
  orderAId = orderRes.body.order._id
}, 30000)

afterAll(async () => {
  await mongoose.connection.collection('users').deleteMany({
    email: { $in: [userAEmail, userBEmail] },
  })
  await mongoose.connection.collection('orders').deleteMany({
    user: {
      $in: [
        new mongoose.Types.ObjectId(userAId),
        new mongoose.Types.ObjectId(userBId),
      ],
    },
  })
  await mongoose.connection.close()
}, 30000)

describe('GET /api/orders/mine', () => {
  it('should return orders for authenticated user', async () => {
    const res = await request(app)
      .get('/api/orders/mine')
      .set('Authorization', `Bearer ${tokenA}`)
    expect(res.status).toBe(200)
    expect(Array.isArray(res.body)).toBe(true)
  })

  it('should reject unauthenticated requests', async () => {
    const res = await request(app).get('/api/orders/mine')
    expect(res.status).toBe(401)
  })
})

describe('POST /api/orders', () => {
  it('should create a new order for authenticated user', async () => {
    const res = await request(app)
      .post('/api/orders')
      .set('Authorization', `Bearer ${tokenA}`)
      .send(sampleOrder)
    expect(res.status).toBe(201)
    expect(res.body).toHaveProperty('order')
    expect(res.body.order).toHaveProperty('_id')
  })

  it('should reject unauthenticated requests', async () => {
    const res = await request(app).post('/api/orders').send(sampleOrder)
    expect(res.status).toBe(401)
  })
})

describe('POST /api/orders - Validation', () => {
  it('should reject an order with an empty orderItems array', async () => {
    const res = await request(app)
      .post('/api/orders')
      .set('Authorization', `Bearer ${tokenA}`)
      .send({ ...sampleOrder, orderItems: [] })
    expect(res.status).toBe(400)
  })

  it('should reject an order with missing shippingAddress', async () => {
    const { shippingAddress: _, ...orderWithoutAddress } = sampleOrder
    const res = await request(app)
      .post('/api/orders')
      .set('Authorization', `Bearer ${tokenA}`)
      .send(orderWithoutAddress)
    expect(res.status).toBe(400)
  })

  it('should reject an order with missing paymentMethod', async () => {
    const { paymentMethod: _, ...orderWithoutPayment } = sampleOrder
    const res = await request(app)
      .post('/api/orders')
      .set('Authorization', `Bearer ${tokenA}`)
      .send(orderWithoutPayment)
    expect(res.status).toBe(400)
  })
})

describe('PUT /api/orders/:id/pay', () => {
  it('should reject unauthenticated requests', async () => {
    const res = await request(app).put(`/api/orders/${orderAId}/pay`)
    expect(res.status).toBe(401)
  })

  it('should reject payment with invalid order ID', async () => {
    const res = await request(app)
      .put('/api/orders/000000000000000000000000/pay')
      .set('Authorization', `Bearer ${tokenA}`)
      .send({ id: 'PAYID-123', status: 'COMPLETED', update_time: new Date().toISOString(), email_address: 'buyer@example.com' })
    expect([404, 500]).toContain(res.status)
  })

  it('should mark an order as paid with a valid PayPal payment result', async () => {
    const res = await request(app)
      .put(`/api/orders/${orderAId}/pay`)
      .set('Authorization', `Bearer ${tokenA}`)
      .send({ id: 'PAYID-123', status: 'COMPLETED', update_time: new Date().toISOString(), email_address: 'buyer@example.com' })
    expect(res.status).toBe(200)
    expect(res.body.order.isPaid).toBe(true)
    expect(res.body.order.paymentResult.paymentId).toBe('PAYID-123')
  })
})

describe('GET /api/orders/:id', () => {
  it('should return an order by ID for the authenticated owner', async () => {
    const res = await request(app)
      .get(`/api/orders/${orderAId}`)
      .set('Authorization', `Bearer ${tokenA}`)
    expect(res.status).toBe(200)
    expect(res.body).toHaveProperty('_id')
  })

  it('should return 404 for a non-existent order ID', async () => {
    const res = await request(app)
      .get('/api/orders/000000000000000000000000')
      .set('Authorization', `Bearer ${tokenA}`)
    expect(res.status).toBe(404)
  })

  it('should return 403 when the order does not belong to the authenticated user', async () => {
    // Mock findById to return an order with a different (undefined) user, which:
    // (1) triggers the ?. null branch in order.user?.toString()
    // (2) triggers the true branch of the ownership check (undefined !== tokenA's id) → 403
    jest.spyOn(OrderModel, 'findById').mockResolvedValueOnce({
      _id: new mongoose.Types.ObjectId(),
      user: undefined,
    } as any)
    const res = await request(app)
      .get(`/api/orders/${orderAId}`)
      .set('Authorization', `Bearer ${tokenA}`)
    jest.restoreAllMocks()
    expect(res.status).toBe(403)
  })
})

describe('Security - Order Ownership', () => {
  it("should not allow user B to access user A's order", async () => {
    const res = await request(app)
      .get(`/api/orders/${orderAId}`)
      .set('Authorization', `Bearer ${tokenB}`)
    expect([401, 403]).toContain(res.status)
  })
})
