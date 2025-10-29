import { Request, Response, NextFunction } from 'express';
import { createOrder as createOrderService, getOrderById, getOrderByNumber, getOrderItems, updateOrderPaymentStatus } from '../services/orderService';
import { ApiError } from '../middleware/errorHandler';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2023-10-16'
});

export const createOrder = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const orderData = req.body;
    console.log('[ORDER CREATE] Received order data:', JSON.stringify(orderData, null, 2));

    if (!orderData.customer || !orderData.items || !orderData.shipping_address) {
      throw new ApiError(400, 'customer, items, and shipping_address are required');
    }

    console.log('[ORDER CREATE] Creating order service...');
    const order = await createOrderService(orderData);
    console.log('[ORDER CREATE] Order created:', order.id);

    // Create Stripe payment intent
    console.log('[ORDER CREATE] Creating Stripe payment intent...');
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(order.total * 100), // Convert to cents
      currency: 'usd',
      metadata: {
        order_id: order.id,
        order_number: order.order_number
      }
    });
    console.log('[ORDER CREATE] Stripe payment intent created:', paymentIntent.id);

    // Update order with payment intent
    console.log('[ORDER CREATE] Updating order with payment intent...');
    await updateOrderPaymentStatus(order.id, 'pending', paymentIntent.id);
    console.log('[ORDER CREATE] Order updated successfully');

    console.log('[ORDER CREATE] Preparing response...');

    // Test if order can be stringified
    try {
      JSON.stringify(order);
      console.log('[ORDER CREATE] Order stringified successfully');
    } catch (stringifyError) {
      console.error('[ORDER CREATE] Failed to stringify order:', stringifyError);
      throw stringifyError;
    }

    const responseData = {
      success: true,
      data: {
        order,
        client_secret: paymentIntent.client_secret
      }
    };

    console.log('[ORDER CREATE] Sending response...');
    res.status(201).json(responseData);
    console.log('[ORDER CREATE] Response sent successfully');
  } catch (error) {
    console.error('[ORDER CREATE ERROR]:', error);
    console.error('[ORDER CREATE ERROR] Stack:', error instanceof Error ? error.stack : 'No stack trace');
    console.error('[ORDER CREATE ERROR] Message:', error instanceof Error ? error.message : String(error));
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
