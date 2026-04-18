import request from 'supertest'
import mongoose from 'mongoose'
import app from '../src/app'
import { ProductModel } from '../src/models/productModel'

let firstSlug: string | null = null
let createdTestProductId: string | null = null

beforeAll(async () => {
  await mongoose.connect(process.env.MONGODB_URI!)

  // Grab a real slug from the DB so slug tests aren't hardcoded
  const res = await request(app).get('/api/products')
  if (Array.isArray(res.body) && res.body.length > 0) {
    firstSlug = res.body[0].slug
  } else {
    // No products in test DB — create one so the slug test isn't skipped
    const testProduct = await ProductModel.create({
      name: 'Test Product',
      slug: `test-product-${Date.now()}`,
      image: '/images/test.jpg',
      brand: 'Test Brand',
      category: 'Test',
      description: 'A test product',
      price: 9.99,
      countInStock: 10,
      rating: 0,
      numReviews: 0,
    })
    firstSlug = testProduct.slug
    createdTestProductId = testProduct._id?.toString() ?? null
  }
}, 30000)

afterAll(async () => {
  if (createdTestProductId) {
    await ProductModel.findByIdAndDelete(createdTestProductId)
  }
  await mongoose.connection.close()
}, 30000)

describe('GET /api/products', () => {
  it('should return a list of products', async () => {
    const res = await request(app).get('/api/products')
    expect(res.status).toBe(200)
    expect(Array.isArray(res.body)).toBe(true)
  })

  it('should return products with required fields (name, price, slug, image)', async () => {
    const res = await request(app).get('/api/products')
    expect(res.status).toBe(200)
    if (res.body.length > 0) {
      const product = res.body[0]
      expect(product).toHaveProperty('name')
      expect(product).toHaveProperty('price')
      expect(product).toHaveProperty('slug')
      expect(product).toHaveProperty('image')
    }
  })
})

describe('GET /api/products/slug/:slug', () => {
  it('should return a single product by valid slug', async () => {
    const res = await request(app).get(`/api/products/slug/${firstSlug}`)
    expect(res.status).toBe(200)
    expect(res.body.slug).toBe(firstSlug)
  })

  it('should return 404 for a non-existent slug', async () => {
    const res = await request(app).get('/api/products/slug/this-slug-does-not-exist')
    expect(res.status).toBe(404)
  })

  it('should handle special characters in slug gracefully', async () => {
    const res = await request(app).get('/api/products/slug/caf%C3%A9-special-$!@')
    expect([200, 404]).toContain(res.status)
  })
})

describe('Security - Products', () => {
  it('should reject NoSQL injection attempt on slug parameter', async () => {
    const res = await request(app).get('/api/products/slug/%7B%24gt%3A%20%27%27%7D')
    expect([400, 404]).toContain(res.status)
  })

  it('should handle extremely long slug gracefully', async () => {
    const longSlug = 'a'.repeat(1000)
    const res = await request(app).get(`/api/products/slug/${longSlug}`)
    expect([400, 404]).toContain(res.status)
  })
})
