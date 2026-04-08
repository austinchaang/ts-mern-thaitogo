import dotenv from 'dotenv'
import mongoose from 'mongoose'
import app from './app'

dotenv.config()

const MONGODB_URI =
  process.env.MONGODB_URI || 'mongodb://localhost/tsmernamazonadb'

mongoose.set('strictQuery', true)

mongoose
  .connect(MONGODB_URI)
  .then(() => {
    console.log('connected to mongodb')
  })
  .catch(() => {
    console.log('error mongodb')
  })

const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 4000
const HOST = '0.0.0.0'

app.listen(PORT, HOST, () => {
  console.log(`Server started at http://${HOST}:${PORT}`)
})
