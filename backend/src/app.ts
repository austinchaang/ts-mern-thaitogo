import cors from 'cors'
import express from 'express'
import rateLimit from 'express-rate-limit'
import { keyRouter } from './routers/keyRouter'
import { orderRouter } from './routers/orderRouter'
import { productRouter } from './routers/productRouter'
import { seedRouter } from './routers/seedRouter'
import { userRouter } from './routers/userRouter'

const app = express()
app.use(
  cors({
    credentials: true,
    origin: ['http://localhost', 'https://frontend-ts-mern-thaitogo-33b1ced323a5.herokuapp.com', 'https://thaitogo.austinchang.ca'],
  })
)

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20,
  skip: () => process.env.NODE_ENV === 'test',
  message: { message: 'Too many requests, please try again later' },
  standardHeaders: true,
  legacyHeaders: false,
})

app.use(express.json({ limit: '10kb' }))
app.use(express.urlencoded({ extended: true, limit: '10kb' }))

app.use('/api/products', productRouter)
app.use('/api/users', authLimiter, userRouter)
app.use('/api/seed', seedRouter)
app.use('/api/orders', orderRouter)
app.use('/api/keys', keyRouter)

export default app
