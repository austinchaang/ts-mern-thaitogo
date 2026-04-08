import express, { Request, Response } from 'express'
import asyncHandler from 'express-async-handler'
import bcrypt from 'bcryptjs'
import { User, UserModel } from '../models/userModel'
import { generateToken } from '../utils'

export const userRouter = express.Router()
// POST /api/users/signin
userRouter.post(
  '/signin',
  asyncHandler(async (req: Request, res: Response) => {
    const { email, password } = req.body
    if (typeof email !== 'string' || typeof password !== 'string') {
      res.status(401).json({ message: 'Invalid email or password' })
      return
    }
    const user = await UserModel.findOne({ email: email.toLowerCase() })
    if (user) {
      if (bcrypt.compareSync(password, user.password)) {
        res.json({
          _id: user._id,
          name: user.name,
          email: user.email,
          isAdmin: user.isAdmin,
          token: generateToken(user),
        })
        return
      }
    }
    res.status(401).json({ message: 'Invalid email or password' })
  })
)

userRouter.post(
  '/signup',
  asyncHandler(async (req: Request, res: Response) => {
    const { name, email, password } = req.body
    if (!name || !email || !password) {
      res.status(400).json({ message: 'Name, email and password are required' })
      return
    }
    if (name.length > 100) {
      res.status(400).json({ message: 'Name must be 100 characters or fewer' })
      return
    }
    if (password.length < 6) {
      res.status(400).json({ message: 'Password must be at least 6 characters' })
      return
    }
    if (password.length > 100) {
      res.status(400).json({ message: 'Password must be 100 characters or fewer' })
      return
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      res.status(400).json({ message: 'Invalid email format' })
      return
    }
    const normalizedEmail = email.toLowerCase()
    const existing = await UserModel.findOne({ email: normalizedEmail })
    if (existing) {
      res.status(400).json({ message: 'Email already registered' })
      return
    }
    const user = await UserModel.create({
      name,
      email: normalizedEmail,
      password: bcrypt.hashSync(password),
    } as User)
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
      token: generateToken(user),
    })
  })
)
