import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { orderAPI } from '../services/api';
import { CheckCircle, Package, Truck } from 'lucide-react';

export default function OrderTracking() {
  const { id } = useParams();
  const [order, setOrder] = useState<any>(null);
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrder = async () => {
      if (!id) return;

      try {
        const { order: orderData, items: itemsData } = await orderAPI.get(id);
        setOrder(orderData);
        setItems(itemsData);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to load order');
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center py-16">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          <p className="mt-4 text-gray-600">Loading order...</p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center py-16">
          <p className="text-red-600 text-lg">{error || 'Order not found'}</p>
        </div>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'text-green-600';
      case 'pending':
        return 'text-yellow-600';
      case 'failed':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const getProductionStatusColor = (status: string) => {
    switch (status) {
      case 'shipped':
        return 'text-green-600';
      case 'in_production':
        return 'text-blue-600';
      case 'pending':
        return 'text-yellow-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-4xl font-bold mb-2">Order #{order.order_number}</h1>
      <p className="text-gray-600 mb-8">
        Placed on {new Date(order.created_at).toLocaleDateString()}
      </p>

      {/* Order Status */}
      <div className="card mb-8">
        <h2 className="text-2xl font-bold mb-6">Order Status</h2>

        <div className="flex justify-between items-center mb-8">
          <div className="flex flex-col items-center flex-1">
            <div className={`rounded-full p-3 mb-2 ${order.payment_status === 'paid' ? 'bg-green-100' : 'bg-gray-100'}`}>
              <CheckCircle className={order.payment_status === 'paid' ? 'text-green-600' : 'text-gray-400'} size={32} />
            </div>
            <p className="font-semibold">Payment</p>
            <p className={`text-sm ${getStatusColor(order.payment_status)}`}>
              {order.payment_status.charAt(0).toUpperCase() + order.payment_status.slice(1)}
            </p>
          </div>

          <div className="flex-1 h-1 bg-gray-200 mx-4">
            <div
              className={`h-full ${order.production_status !== 'pending' ? 'bg-primary-600' : 'bg-gray-200'}`}
            />
          </div>

          <div className="flex flex-col items-center flex-1">
            <div className={`rounded-full p-3 mb-2 ${order.production_status !== 'pending' ? 'bg-blue-100' : 'bg-gray-100'}`}>
              <Package className={order.production_status !== 'pending' ? 'text-blue-600' : 'text-gray-400'} size={32} />
            </div>
            <p className="font-semibold">Production</p>
            <p className={`text-sm ${getProductionStatusColor(order.production_status)}`}>
              {order.production_status.replace('_', ' ').charAt(0).toUpperCase() + order.production_status.replace('_', ' ').slice(1)}
            </p>
          </div>

          <div className="flex-1 h-1 bg-gray-200 mx-4">
            <div
              className={`h-full ${order.production_status === 'shipped' ? 'bg-primary-600' : 'bg-gray-200'}`}
            />
          </div>

          <div className="flex flex-col items-center flex-1">
            <div className={`rounded-full p-3 mb-2 ${order.production_status === 'shipped' ? 'bg-green-100' : 'bg-gray-100'}`}>
              <Truck className={order.production_status === 'shipped' ? 'text-green-600' : 'text-gray-400'} size={32} />
            </div>
            <p className="font-semibold">Shipped</p>
            <p className={`text-sm ${order.production_status === 'shipped' ? 'text-green-600' : 'text-gray-400'}`}>
              {order.production_status === 'shipped' ? 'Delivered' : 'Pending'}
            </p>
          </div>
        </div>

        {order.tracking_number && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="font-semibold text-green-900 mb-1">Tracking Number</p>
            <p className="text-green-700 font-mono">{order.tracking_number}</p>
          </div>
        )}
      </div>

      {/* Order Items */}
      <div className="card mb-8">
        <h2 className="text-2xl font-bold mb-4">Order Items</h2>
        <div className="space-y-4">
          {items.map((item, idx) => (
            <div key={idx} className="flex gap-4 pb-4 border-b last:border-b-0">
              <div className="flex-1">
                <p className="font-semibold">Custom Item</p>
                <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
              </div>
              <div className="text-right">
                <p className="font-semibold">${item.total_price.toFixed(2)}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Shipping Address */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="card">
          <h2 className="text-xl font-bold mb-3">Shipping Address</h2>
          <div className="text-gray-700">
            <p>{order.shipping_address.line1}</p>
            {order.shipping_address.line2 && <p>{order.shipping_address.line2}</p>}
            <p>
              {order.shipping_address.city}, {order.shipping_address.state} {order.shipping_address.postal_code}
            </p>
            <p>{order.shipping_address.country}</p>
          </div>
        </div>

        <div className="card">
          <h2 className="text-xl font-bold mb-3">Order Summary</h2>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>${order.subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Shipping</span>
              <span>${order.shipping.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Tax</span>
              <span>${order.tax.toFixed(2)}</span>
            </div>
            <div className="border-t pt-2 flex justify-between font-bold text-lg">
              <span>Total</span>
              <span className="text-primary-600">${order.total.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
