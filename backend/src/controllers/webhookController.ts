import { Request, Response, NextFunction } from 'express';
import Stripe from 'stripe';
import { updateOrderPaymentStatus } from '../services/orderService';
import { logger } from '../utils/logger';
import { env } from '../config/env';

const stripe = new Stripe(env.STRIPE_SECRET_KEY, {
  apiVersion: '2023-10-16'
});

export const handleProductionUpdate = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    // TODO: Handle production status webhook from printer
    res.status(200).json({ message: 'Production update received' });
  } catch (error) {
    next(error);
  }
};

export const handleStripeWebhook = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const sig = req.headers['stripe-signature'];

  if (!sig) {
    logger.error('Missing stripe-signature header');
    res.status(400).send('Missing stripe-signature header');
    return;
  }

  let event: Stripe.Event;

  try {
    // Verify webhook signature
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err: any) {
    logger.error('Webhook signature verification failed', { error: err.message });
    res.status(400).send(`Webhook Error: ${err.message}`);
    return;
  }

  try {
    // Handle the event
    switch (event.type) {
      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        logger.info('Payment succeeded', {
          payment_intent_id: paymentIntent.id,
          order_id: paymentIntent.metadata.order_id,
          order_number: paymentIntent.metadata.order_number,
          amount: paymentIntent.amount
        });

        // Update order status to paid
        if (paymentIntent.metadata.order_id) {
          await updateOrderPaymentStatus(
            paymentIntent.metadata.order_id,
            'paid',
            paymentIntent.id
          );
          logger.info('Order payment status updated to paid', {
            order_id: paymentIntent.metadata.order_id
          });
        }
        break;
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        logger.error('Payment failed', {
          payment_intent_id: paymentIntent.id,
          order_id: paymentIntent.metadata.order_id,
          order_number: paymentIntent.metadata.order_number,
          error: paymentIntent.last_payment_error?.message
        });

        // Update order status to failed
        if (paymentIntent.metadata.order_id) {
          await updateOrderPaymentStatus(
            paymentIntent.metadata.order_id,
            'failed',
            paymentIntent.id
          );
        }
        break;
      }

      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        logger.info('Checkout session completed', {
          session_id: session.id,
          payment_intent: session.payment_intent,
          customer_email: session.customer_details?.email
        });
        break;
      }

      case 'charge.refunded': {
        const charge = event.data.object as Stripe.Charge;
        logger.info('Charge refunded', {
          charge_id: charge.id,
          payment_intent: charge.payment_intent,
          amount_refunded: charge.amount_refunded
        });
        // TODO: Handle refund logic - update order status
        break;
      }

      default:
        logger.info('Unhandled webhook event type', { type: event.type });
    }

    // Return a 200 response to acknowledge receipt of the event
    res.json({ received: true });
  } catch (error: any) {
    logger.error('Error processing webhook event', {
      error: error.message,
      event_type: event.type
    });
    next(error);
  }
};
