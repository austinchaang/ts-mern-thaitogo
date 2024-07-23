import express, { Request, Response } from 'express'
import asyncHandler from 'express-async-handler'
import { sampleProducts, sampleUsers } from '../data'
import { ProductModel } from '../models/productModel'
import { UserModel } from '../models/userModel'

export const seedRouter = express.Router()

seedRouter.get(
  '/',
  asyncHandler(async (req: Request, res: Response) => {
    try {
      console.log('Seeding started');
      await ProductModel.deleteMany({})
      const createdProducts = await ProductModel.insertMany(sampleProducts)
      console.log('Products seeded');

      await UserModel.deleteMany({})
      const createdUsers = await UserModel.insertMany(sampleUsers)
      console.log('Users seeded');

      res.json({ createdProducts, createdUsers })
    } catch (error) {
      console.error('Seeding error:', error);
      res.status(500).json({ message: 'Seeding failed', error: error });
    }
  })
)

