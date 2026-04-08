import cors from 'cors'
import express from 'express'
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

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.use('/api/products', productRouter)
app.use('/api/users', userRouter)
app.use('/api/seed', seedRouter)
app.use('/api/orders', orderRouter)
app.use('/api/keys', keyRouter)

export default app
