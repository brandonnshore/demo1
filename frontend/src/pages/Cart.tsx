import { Link } from 'react-router-dom';
import { useCartStore } from '../stores/cartStore';
import { Minus, Plus, X, ShoppingBag } from 'lucide-react';

export default function Cart() {
  const { items, removeItem, updateQuantity, getTotalPrice } = useCartStore();

  const handleIncrement = (id: string, currentQuantity: number) => {
    updateQuantity(id, currentQuantity + 1);
  };

  const handleDecrement = (id: string, currentQuantity: number) => {
    if (currentQuantity > 1) {
      updateQuantity(id, currentQuantity - 1);
    }
  };

  const getTotalItems = () => {
    return items.reduce((total, item) => total + item.quantity, 0);
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center">
          <div className="mb-8">
            <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
              <ShoppingBag size={48} className="text-gray-400" />
            </div>
            <h1 className="text-3xl font-bold mb-4">Your cart is empty</h1>
            <p className="text-gray-600 text-lg mb-8">
              Start designing your custom apparel and add items to your cart.
            </p>
          </div>
          <div className="space-y-3">
            <Link
              to="/products/classic-tee"
              className="block w-full px-8 py-4 bg-black text-white font-medium rounded-lg hover:bg-gray-800 transition-colors"
            >
              Start Designing
            </Link>
            <Link
              to="/products"
              className="block w-full px-8 py-4 border-2 border-gray-300 text-gray-900 font-medium rounded-lg hover:bg-gray-100 transition-colors"
            >
              Browse Products
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-12">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl lg:text-5xl font-bold mb-2">Shopping Cart</h1>
          <p className="text-sm sm:text-base text-gray-600">
            {getTotalItems()} {getTotalItems() === 1 ? 'item' : 'items'} in your cart
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item, index) => (
              <div
                key={item.id}
                className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-sm hover:shadow-md transition-shadow group"
                style={{
                  animation: `slideIn 0.3s ease-out ${index * 0.1}s backwards`
                }}
              >
                <div className="flex gap-3 sm:gap-6">
                  {/* Product Image - Clickable */}
                  <Link
                    to={`/products/classic-tee?editCartItem=${item.id}`}
                    className="flex-shrink-0 cursor-pointer"
                  >
                    <div className="w-20 h-20 sm:w-32 sm:h-32 bg-gray-100 rounded-lg sm:rounded-xl overflow-hidden group-hover:ring-2 group-hover:ring-black transition-all">
                      {item.mockupUrl ? (
                        <img
                          src={item.mockupUrl}
                          alt={item.productTitle}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          <ShoppingBag size={48} />
                        </div>
                      )}
                    </div>
                  </Link>

                  {/* Product Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-2 sm:mb-3">
                      <div className="flex-1 min-w-0 pr-2">
                        <Link
                          to={`/products/classic-tee?editCartItem=${item.id}`}
                          className="font-bold text-base sm:text-xl mb-1 hover:text-gray-600 transition-colors block"
                        >
                          {item.productTitle}
                        </Link>
                        <div className="flex gap-1.5 sm:gap-2 text-xs sm:text-sm text-gray-600 mt-1">
                          <span className="px-2 sm:px-3 py-0.5 sm:py-1 bg-gray-100 rounded-full">
                            {item.variantColor}
                          </span>
                          <span className="px-2 sm:px-3 py-0.5 sm:py-1 bg-gray-100 rounded-full">
                            {item.variantSize}
                          </span>
                        </div>
                        <Link
                          to={`/products/classic-tee?editCartItem=${item.id}`}
                          className="text-xs sm:text-sm text-blue-600 hover:text-blue-800 mt-1.5 sm:mt-2 inline-block"
                        >
                          Edit Design →
                        </Link>
                      </div>

                      {/* Remove Button */}
                      <button
                        onClick={() => removeItem(item.id)}
                        className="p-1.5 sm:p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0"
                        aria-label="Remove item"
                      >
                        <X size={18} />
                      </button>
                    </div>

                    {/* Price and Quantity */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0 mt-3 sm:mt-4">
                      <div className="text-xl sm:text-2xl font-bold">
                        ${(item.unitPrice * item.quantity).toFixed(2)}
                      </div>

                      {/* Quantity Controls */}
                      <div className="flex items-center gap-2 sm:gap-3">
                        <span className="text-xs sm:text-sm text-gray-600">
                          ${item.unitPrice.toFixed(2)} each
                        </span>
                        <div className="flex items-center bg-gray-100 rounded-lg">
                          <button
                            onClick={() => handleDecrement(item.id, item.quantity)}
                            disabled={item.quantity <= 1}
                            className="p-2 hover:bg-gray-200 rounded-l-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            aria-label="Decrease quantity"
                          >
                            <Minus size={16} />
                          </button>
                          <span className="px-3 sm:px-4 py-2 font-medium min-w-[2.5rem] sm:min-w-[3rem] text-center text-sm">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => handleIncrement(item.id, item.quantity)}
                            className="p-2 hover:bg-gray-200 rounded-r-lg transition-colors"
                            aria-label="Increase quantity"
                          >
                            <Plus size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* Continue Shopping Link */}
            <Link
              to="/products"
              className="block text-center py-4 text-gray-600 hover:text-gray-900 transition-colors"
            >
              ← Continue Shopping
            </Link>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-sm lg:sticky lg:top-24">
              <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">Order Summary</h2>

              <div className="space-y-3 sm:space-y-4 mb-4 sm:mb-6">
                <div className="flex justify-between text-sm sm:text-lg">
                  <span className="text-gray-600">Subtotal ({getTotalItems()} items)</span>
                  <span className="font-medium">${getTotalPrice().toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm sm:text-lg">
                  <span className="text-gray-600">Shipping</span>
                  <span className="text-gray-600">TBD</span>
                </div>
                <div className="flex justify-between text-sm sm:text-lg">
                  <span className="text-gray-600">Tax</span>
                  <span className="text-gray-600">TBD</span>
                </div>

                <div className="border-t pt-3 sm:pt-4">
                  <div className="flex justify-between text-xl sm:text-2xl font-bold">
                    <span>Total</span>
                    <span>${getTotalPrice().toFixed(2)}</span>
                  </div>
                  <p className="text-xs sm:text-sm text-gray-500 mt-2">
                    Final price calculated at checkout
                  </p>
                </div>
              </div>

              <Link
                to="/checkout"
                className="block w-full px-6 sm:px-8 py-3 sm:py-4 bg-black text-white text-center font-medium rounded-lg hover:bg-gray-800 transition-colors mb-3"
              >
                Proceed to Checkout
              </Link>

              {/* Trust Badges */}
              <div className="mt-6 pt-6 border-t space-y-3">
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <svg className="w-3 h-3 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span>Secure checkout</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <div className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <svg className="w-3 h-3 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span>Fast turnaround</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <div className="w-5 h-5 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <svg className="w-3 h-3 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span>Quality guaranteed</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
