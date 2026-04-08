import { NextFunction, Request, Response } from 'express'
import jwt from 'jsonwebtoken'
import { User } from './models/userModel'

export const generateToken = (user: User) => {
  return jwt.sign(
    {
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
    },
    process.env.JWT_SECRET || 'somethingsecret',
    {
      expiresIn: '30d',
    }
  )
}

export const isAuth = (req: Request, res: Response, next: NextFunction) => {
  const { authorization } = req.headers
  if (authorization && authorization.startsWith('Bearer ')) {
    try {
      const token = authorization.slice(7)
      const decode = jwt.verify(
        token,
        process.env.JWT_SECRET || 'somethingsecret'
      )
      req.user = decode as {
        _id: string
        name: string
        email: string
        isAdmin: boolean
        token: string
      }
      next()
    } catch {
      res.status(401).json({ message: 'No token, invalid token' })
    }
  } else {
    res.status(401).json({ message: 'No token, invalid token' })
  }
}
