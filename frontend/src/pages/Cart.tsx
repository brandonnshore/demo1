import { Link } from 'react-router-dom';
import { useCartStore } from '../stores/cartStore';

export default function Cart() {
  const { items, removeItem, updateQuantity, getTotalPrice } = useCartStore();

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-4xl font-bold mb-8">Shopping Cart</h1>
        <div className="text-center py-16">
          <p className="text-gray-600 text-lg mb-4">Your cart is empty</p>
          <Link to="/products" className="btn-primary">
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-4xl font-bold mb-8">Shopping Cart</h1>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          {items.map((item) => (
            <div key={item.id} className="card mb-4 flex gap-4">
              <div className="flex-1">
                <h3 className="font-semibold text-lg">{item.productTitle}</h3>
                <p className="text-gray-600">
                  {item.variantColor} / {item.variantSize}
                </p>
                <p className="text-gray-600">
                  ${item.unitPrice.toFixed(2)} each
                </p>
              </div>
              <div className="flex items-center gap-4">
                <input
                  type="number"
                  min="1"
                  value={item.quantity}
                  onChange={(e) => updateQuantity(item.id, parseInt(e.target.value))}
                  className="w-20 input"
                />
                <button
                  onClick={() => removeItem(item.id)}
                  className="text-red-600 hover:text-red-700"
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="lg:col-span-1">
          <div className="card sticky top-24">
            <h2 className="text-2xl font-bold mb-4">Order Summary</h2>
            <div className="space-y-2 mb-6">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>${getTotalPrice().toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Shipping</span>
                <span>Calculated at checkout</span>
              </div>
              <div className="border-t pt-2 flex justify-between font-bold text-lg">
                <span>Total</span>
                <span>${getTotalPrice().toFixed(2)}</span>
              </div>
            </div>
            <Link to="/checkout" className="btn-primary w-full text-center block">
              Proceed to Checkout
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
