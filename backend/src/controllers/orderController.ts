import { Request, Response, NextFunction } from 'express';
import { createOrder as createOrderService, getOrderById, getOrderByNumber, getOrderItems, updateOrderPaymentStatus } from '../services/orderService';
import { ApiError } from '../middleware/errorHandler';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2024-11-20.acacia'
});

export const createOrder = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const orderData = req.body;

    if (!orderData.customer || !orderData.items || !orderData.shipping_address) {
      throw new ApiError(400, 'customer, items, and shipping_address are required');
    }

    const order = await createOrderService(orderData);

    // Create Stripe payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(order.total * 100), // Convert to cents
      currency: 'usd',
      metadata: {
        order_id: order.id,
        order_number: order.order_number
      }
    });

    // Update order with payment intent
    await updateOrderPaymentStatus(order.id, 'pending', paymentIntent.id);

    res.status(201).json({
      success: true,
      data: {
        order,
        client_secret: paymentIntent.client_secret
      }
    });
  } catch (error) {
    next(error);
  }
};

export const capturePayment = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { payment_intent_id } = req.body;

    if (!payment_intent_id) {
      throw new ApiError(400, 'payment_intent_id is required');
    }

    // Verify payment intent with Stripe
    const paymentIntent = await stripe.paymentIntents.retrieve(payment_intent_id);

    if (paymentIntent.status === 'succeeded') {
      const order = await updateOrderPaymentStatus(id, 'paid', payment_intent_id);

      res.status(200).json({
        success: true,
        data: { order }
      });
    } else {
      throw new ApiError(400, 'Payment not completed');
    }
  } catch (error) {
    next(error);
  }
};

export const getOrder = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    // Try to get by ID first, then by order number
    let order = await getOrderById(id);

    if (!order) {
      order = await getOrderByNumber(id);
    }

    if (!order) {
      throw new ApiError(404, 'Order not found');
    }

    const items = await getOrderItems(order.id);

    res.status(200).json({
      success: true,
      data: {
        order,
        items
      }
    });
  } catch (error) {
    next(error);
  }
};
