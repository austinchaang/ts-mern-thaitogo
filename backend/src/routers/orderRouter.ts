import express, { Request, Response } from 'express'
import asyncHandler from 'express-async-handler'
import { Order, OrderModel } from '../models/orderModel'
import { Product } from '../models/productModel'
import { isAuth } from '../utils'
import { Express } from '../types/Request';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const paypal = require('@paypal/checkout-server-sdk') as Record<string, any>

export const orderRouter = express.Router()

type CustomRequest = Express.Request;

export function getPaypalClient() {
  const clientId = process.env.PAYPAL_CLIENT_ID || 'sb'
  const clientSecret = process.env.PAYPAL_SECRET || ''
  const environment =
    process.env.NODE_ENV === 'production'
      ? new paypal.core.LiveEnvironment(clientId, clientSecret)
      : new paypal.core.SandboxEnvironment(clientId, clientSecret)
  return new paypal.core.PayPalHttpClient(environment)
}

orderRouter.get(
  '/mine',
  isAuth,
  asyncHandler(async (req: Request, res: Response) => {
    const customReq = req as CustomRequest; // Type assertion
    const orders = await OrderModel.find({ user: customReq.user._id })
    res.json(orders)
  })
)

orderRouter.get(
  // /api/orders/:id
  '/:id',
  isAuth,
  asyncHandler(async (req: Request, res: Response) => {
    const customReq = req as CustomRequest
    const order = await OrderModel.findById(req.params.id)
    if (order) {
      if (order.user?.toString() !== customReq.user._id.toString()) {
        res.status(403).json({ message: 'Not authorized to view this order' })
        return
      }
      res.json(order)
    } else {
      res.status(404).json({ message: 'Order Not Found' })
    }
  })
)

orderRouter.post(
  '/',
  isAuth,
  asyncHandler(async (req: Request, res: Response) => {
    if (!req.body.orderItems || req.body.orderItems.length === 0) {
      res.status(400).json({ message: 'Cart is empty' })
      return
    }
    if (!req.body.shippingAddress) {
      res.status(400).json({ message: 'Shipping address is required' })
      return
    }
    if (!req.body.paymentMethod) {
      res.status(400).json({ message: 'Payment method is required' })
      return
    }
    {
      const customReq = req as CustomRequest; // Type assertion
      const createdOrder = await OrderModel.create({
        orderItems: req.body.orderItems.map((x: Product) => ({
          ...x,
          product: x._id,
        })),
        shippingAddress: req.body.shippingAddress,
        paymentMethod: req.body.paymentMethod,
        itemsPrice: req.body.itemsPrice,
        shippingPrice: req.body.shippingPrice,
        taxPrice: req.body.taxPrice,
        totalPrice: req.body.totalPrice,
        user: customReq.user._id,
      } as Order)
      res.status(201).json({ message: 'Order Created', order: createdOrder })
    }
  })
)

orderRouter.put(
  '/:id/pay',
  isAuth,
  asyncHandler(async (req: Request, res: Response) => {
    const order = await OrderModel.findById(req.params.id).populate('user')

    if (!order) {
      res.status(404).send({ message: 'Order Not Found' })
      return
    }

    const paypalClient = getPaypalClient()
    const paypalRequest = new paypal.orders.OrdersGetRequest(req.body.id)
    const paypalResponse = await paypalClient.execute(paypalRequest)
    const paypalOrder = paypalResponse.result

    const capture = paypalOrder?.purchase_units?.[0]?.payments?.captures?.[0]
    const capturedAmount = parseFloat(capture?.amount?.value ?? 'NaN')
    const expectedAmount = Math.round(order.totalPrice * 100)
    const actualAmount = Math.round(capturedAmount * 100)

    if (capture?.status !== 'COMPLETED' || actualAmount !== expectedAmount) {
      res.status(400).json({ message: 'Payment verification failed' })
      return
    }

    order.isPaid = true
    order.paidAt = new Date(Date.now())
    order.paymentResult = {
      paymentId: req.body.id,
      status: req.body.status,
      update_time: req.body.update_time,
      email_address: req.body.email_address,
    }
    const updatedOrder = await order.save()

    res.send({ order: updatedOrder, message: 'Order Paid Successfully' })
  })
)
