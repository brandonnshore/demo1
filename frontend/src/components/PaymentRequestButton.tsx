import { useEffect, useState } from 'react';
import { PaymentRequestButtonElement, useStripe } from '@stripe/react-stripe-js';
import type { PaymentRequest } from '@stripe/stripe-js';

interface PaymentRequestButtonProps {
  totalAmount: number;
  onPaymentSuccess: (paymentMethodId: string) => Promise<void>;
  disabled?: boolean;
}

export default function PaymentRequestButton({
  totalAmount,
  onPaymentSuccess,
}: PaymentRequestButtonProps) {
  const stripe = useStripe();
  const [paymentRequest, setPaymentRequest] = useState<PaymentRequest | null>(null);
  const [canMakePayment, setCanMakePayment] = useState(false);

  useEffect(() => {
    if (!stripe) {
      return;
    }

    const pr = stripe.paymentRequest({
      country: 'US',
      currency: 'usd',
      total: {
        label: 'Total',
        amount: Math.round(totalAmount * 100), // Convert to cents
      },
      requestPayerName: true,
      requestPayerEmail: true,
      requestPayerPhone: true,
      requestShipping: true,
      shippingOptions: [
        {
          id: 'free-shipping',
          label: 'Free Shipping',
          detail: 'Arrives in 5-7 business days',
          amount: 0,
        },
      ],
    });

    // Check if the browser supports Payment Request API
    pr.canMakePayment().then((result) => {
      console.log('[Payment Request] Can make payment:', result);
      if (result) {
        setPaymentRequest(pr);
        setCanMakePayment(true);
        console.log('[Payment Request] Apple Pay/Google Pay available!');
      } else {
        console.log('[Payment Request] No digital wallets available');
      }
    }).catch((error) => {
      console.error('[Payment Request] Error checking payment availability:', error);
    });

    pr.on('paymentmethod', async (event) => {
      try {
        await onPaymentSuccess(event.paymentMethod.id);
        event.complete('success');
      } catch (error) {
        console.error('Payment failed:', error);
        event.complete('fail');
      }
    });

    return () => {
      pr.off('paymentmethod');
    };
  }, [stripe, totalAmount, onPaymentSuccess]);

  useEffect(() => {
    if (paymentRequest) {
      paymentRequest.update({
        total: {
          label: 'Total',
          amount: Math.round(totalAmount * 100),
        },
      });
    }
  }, [totalAmount, paymentRequest]);

  if (!canMakePayment || !paymentRequest) {
    return null;
  }

  return (
    <div className="mb-6">
      <PaymentRequestButtonElement
        options={{
          paymentRequest,
          style: {
            paymentRequestButton: {
              type: 'default',
              theme: 'dark',
              height: '48px',
            },
          },
        }}
      />
      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-4 bg-white text-gray-500">Or pay with card</span>
        </div>
      </div>
    </div>
  );
}
