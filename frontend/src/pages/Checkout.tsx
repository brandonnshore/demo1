import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCartStore } from '../stores/cartStore';
import { orderAPI } from '../services/api';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import PaymentRequestButton from '../components/PaymentRequestButton';
import { trackPurchase, trackBeginCheckout } from '../utils/analytics';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '');

function CheckoutForm() {
  const navigate = useNavigate();
  const stripe = useStripe();
  const elements = useElements();
  const { items, getTotalPrice, clearCart } = useCartStore();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Track begin_checkout event when component mounts
  useEffect(() => {
    if (items.length > 0) {
      trackBeginCheckout(getTotalPrice(), items);
    }
  }, []); // Run only once on mount

  // Form state
  const [customerInfo, setCustomerInfo] = useState({
    email: '',
    name: '',
    phone: '',
  });

  const [shippingAddress, setShippingAddress] = useState({
    line1: '',
    line2: '',
    city: '',
    state: '',
    postal_code: '',
    country: 'US',
  });

  const handlePaymentRequestPayment = async (paymentMethodId: string) => {
    if (!stripe) {
      throw new Error('Stripe not initialized');
    }

    // Validate form data
    if (!customerInfo.email || !customerInfo.name || !shippingAddress.line1 || !shippingAddress.city || !shippingAddress.state || !shippingAddress.postal_code) {
      throw new Error('Please fill out all required fields before using digital wallet payment');
    }

    setLoading(true);
    setError(null);

    try {
      // Create order
      const orderData = {
        customer: customerInfo,
        items: items.map((item) => ({
          variant_id: item.variantId,
          quantity: item.quantity,
          unit_price: item.unitPrice,
          total_price: item.unitPrice * item.quantity,
          customization: item.customization,
        })),
        shipping_address: shippingAddress,
        billing_address: shippingAddress,
        subtotal: getTotalPrice(),
        tax: 0,
        shipping: 0,
        total: getTotalPrice(),
      };

      const { order, client_secret } = await orderAPI.create(orderData);

      // Confirm payment with the payment method from Apple Pay/Google Pay
      const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(client_secret, {
        payment_method: paymentMethodId,
      });

      if (stripeError) {
        throw new Error(stripeError.message);
      }

      if (paymentIntent && paymentIntent.status === 'succeeded') {
        // Capture payment
        await orderAPI.capturePayment(order.id, paymentIntent.id);

        // Track purchase in Google Analytics
        trackPurchase(order.order_number, getTotalPrice(), items);

        // Clear cart
        clearCart();

        // Redirect to order tracking
        navigate(`/orders/${order.order_number}`);
      }
    } catch (err: any) {
      console.error('Checkout error:', err);
      setError(err.message || 'Payment failed. Please try again.');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Create order
      const orderData = {
        customer: customerInfo,
        items: items.map((item) => ({
          variant_id: item.variantId,
          quantity: item.quantity,
          unit_price: item.unitPrice,
          total_price: item.unitPrice * item.quantity,
          customization: item.customization,
        })),
        shipping_address: shippingAddress,
        billing_address: shippingAddress,
        subtotal: getTotalPrice(),
        tax: 0,
        shipping: 0,
        total: getTotalPrice(),
      };

      const { order, client_secret } = await orderAPI.create(orderData);

      // Confirm payment with Stripe
      const cardElement = elements.getElement(CardElement);
      if (!cardElement) {
        throw new Error('Card element not found');
      }

      const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(client_secret, {
        payment_method: {
          card: cardElement,
          billing_details: {
            name: customerInfo.name,
            email: customerInfo.email,
          },
        },
      });

      if (stripeError) {
        throw new Error(stripeError.message);
      }

      if (paymentIntent && paymentIntent.status === 'succeeded') {
        // Capture payment
        await orderAPI.capturePayment(order.id, paymentIntent.id);

        // Track purchase in Google Analytics
        trackPurchase(order.order_number, getTotalPrice(), items);

        // Clear cart
        clearCart();

        // Redirect to order tracking
        navigate(`/orders/${order.order_number}`);
      }
    } catch (err: any) {
      console.error('Checkout error:', err);
      setError(err.message || 'Payment failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-gray-600 text-lg mb-4">Your cart is empty</p>
        <button onClick={() => navigate('/products')} className="btn-primary">
          Continue Shopping
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="grid lg:grid-cols-3 gap-8">
      {/* Checkout Form */}
      <div className="lg:col-span-2 space-y-6">
        {/* Customer Information */}
        <div className="card">
          <h2 className="text-2xl font-bold mb-4">Customer Information</h2>
          <div className="space-y-4">
            <div>
              <label className="block font-semibold mb-1">Email</label>
              <input
                type="email"
                required
                value={customerInfo.email}
                onChange={(e) => setCustomerInfo({ ...customerInfo, email: e.target.value })}
                className="input"
              />
            </div>
            <div>
              <label className="block font-semibold mb-1">Full Name</label>
              <input
                type="text"
                required
                value={customerInfo.name}
                onChange={(e) => setCustomerInfo({ ...customerInfo, name: e.target.value })}
                className="input"
              />
            </div>
            <div>
              <label className="block font-semibold mb-1">Phone</label>
              <input
                type="tel"
                value={customerInfo.phone}
                onChange={(e) => setCustomerInfo({ ...customerInfo, phone: e.target.value })}
                className="input"
              />
            </div>
          </div>
        </div>

        {/* Shipping Address */}
        <div className="card">
          <h2 className="text-2xl font-bold mb-4">Shipping Address</h2>
          <div className="space-y-4">
            <div>
              <label className="block font-semibold mb-1">Address Line 1</label>
              <input
                type="text"
                required
                value={shippingAddress.line1}
                onChange={(e) => setShippingAddress({ ...shippingAddress, line1: e.target.value })}
                className="input"
              />
            </div>
            <div>
              <label className="block font-semibold mb-1">Address Line 2</label>
              <input
                type="text"
                value={shippingAddress.line2}
                onChange={(e) => setShippingAddress({ ...shippingAddress, line2: e.target.value })}
                className="input"
              />
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold mb-1">City</label>
                <input
                  type="text"
                  required
                  value={shippingAddress.city}
                  onChange={(e) => setShippingAddress({ ...shippingAddress, city: e.target.value })}
                  className="input"
                />
              </div>
              <div>
                <label className="block font-semibold mb-1">State</label>
                <input
                  type="text"
                  required
                  value={shippingAddress.state}
                  onChange={(e) => setShippingAddress({ ...shippingAddress, state: e.target.value })}
                  className="input"
                />
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold mb-1">ZIP Code</label>
                <input
                  type="text"
                  required
                  value={shippingAddress.postal_code}
                  onChange={(e) => setShippingAddress({ ...shippingAddress, postal_code: e.target.value })}
                  className="input"
                />
              </div>
              <div>
                <label className="block font-semibold mb-1">Country</label>
                <select
                  value={shippingAddress.country}
                  onChange={(e) => setShippingAddress({ ...shippingAddress, country: e.target.value })}
                  className="input"
                >
                  <option value="US">United States</option>
                  <option value="CA">Canada</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Payment Information */}
        <div className="card">
          <h2 className="text-2xl font-bold mb-4">Payment Information</h2>

          {/* Apple Pay / Google Pay */}
          <PaymentRequestButton
            totalAmount={getTotalPrice()}
            onPaymentSuccess={handlePaymentRequestPayment}
            disabled={loading}
          />

          <div className="p-4 border border-gray-300 rounded-lg">
            <CardElement
              options={{
                style: {
                  base: {
                    fontSize: '16px',
                    color: '#424770',
                    '::placeholder': {
                      color: '#aab7c4',
                    },
                  },
                  invalid: {
                    color: '#9e2146',
                  },
                },
              }}
            />
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}
      </div>

      {/* Order Summary */}
      <div className="lg:col-span-1">
        <div className="card sticky top-24">
          <h2 className="text-2xl font-bold mb-4">Order Summary</h2>

          <div className="space-y-3 mb-6">
            {items.map((item) => (
              <div key={item.id} className="flex gap-3 pb-3 border-b">
                <div className="flex-1">
                  <p className="font-semibold">{item.productTitle}</p>
                  <p className="text-sm text-gray-600">
                    {item.variantColor} / {item.variantSize}
                  </p>
                  <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold">${(item.unitPrice * item.quantity).toFixed(2)}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="space-y-2 mb-6">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>${getTotalPrice().toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Shipping</span>
              <span>FREE</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Tax</span>
              <span>$0.00</span>
            </div>
            <div className="border-t pt-2 flex justify-between font-bold text-lg">
              <span>Total</span>
              <span className="text-primary-600">${getTotalPrice().toFixed(2)}</span>
            </div>
          </div>

          <button
            type="submit"
            disabled={!stripe || loading}
            className="btn-primary w-full"
          >
            {loading ? 'Processing...' : `Pay $${getTotalPrice().toFixed(2)}`}
          </button>

          <p className="text-xs text-gray-500 mt-4 text-center">
            Your payment information is secure and encrypted.
          </p>
        </div>
      </div>
    </form>
  );
}

export default function Checkout() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-4xl font-bold mb-8">Checkout</h1>
      <Elements stripe={stripePromise}>
        <CheckoutForm />
      </Elements>
    </div>
  );
}
