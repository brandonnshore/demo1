import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { productAPI } from '../services/api';
import Customizer from '../components/Customizer';

export default function ProductDetail() {
  const { slug } = useParams();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) return;

    // Load mock data immediately for instant display
    const mockData = {
      product: {
        id: '1',
        title: 'Classic Cotton T-Shirt',
        slug: 'classic-tee',
        description: 'Premium 100% cotton t-shirt. Soft, comfortable, and perfect for custom designs.',
        images: ['/assets/blank-tshirt.png'],
        status: 'active' as const,
        variants: [
          { id: '1', product_id: '1', color: 'White', size: 'S', sku: 'TEE-WHT-S', base_price: 12.99, stock_level: 100 },
          { id: '2', product_id: '1', color: 'White', size: 'M', sku: 'TEE-WHT-M', base_price: 12.99, stock_level: 100 },
          { id: '3', product_id: '1', color: 'White', size: 'L', sku: 'TEE-WHT-L', base_price: 12.99, stock_level: 100 },
          { id: '4', product_id: '1', color: 'Black', size: 'S', sku: 'TEE-BLK-S', base_price: 12.99, stock_level: 100 },
          { id: '5', product_id: '1', color: 'Black', size: 'M', sku: 'TEE-BLK-M', base_price: 12.99, stock_level: 100 },
          { id: '6', product_id: '1', color: 'Black', size: 'L', sku: 'TEE-BLK-L', base_price: 12.99, stock_level: 100 },
          { id: '7', product_id: '1', color: 'Navy', size: 'S', sku: 'TEE-NAV-S', base_price: 12.99, stock_level: 100 },
          { id: '8', product_id: '1', color: 'Navy', size: 'M', sku: 'TEE-NAV-M', base_price: 12.99, stock_level: 100 },
          { id: '9', product_id: '1', color: 'Navy', size: 'L', sku: 'TEE-NAV-L', base_price: 12.99, stock_level: 100 }
        ]
      },
      decorationMethods: [
        {
          id: '1',
          name: 'dtg',
          display_name: 'Direct to Garment',
          description: 'Full-color digital printing',
          pricing_rules: {
            base_price: 10,
            per_location: 6,
            quantity_breaks: [
              { min: 1, max: 5, multiplier: 1 },
              { min: 6, max: 11, multiplier: 0.95 },
              { min: 12, max: null, multiplier: 0.85 }
            ]
          },
          file_requirements: {
            min_dpi: 300,
            accepted_formats: ['png', 'jpg', 'pdf']
          }
        }
      ]
    };

    setData(mockData);
    setLoading(false);

    // Try to fetch real data in background, but don't wait for it
    productAPI.getBySlug(slug)
      .then(result => {
        if (result && result.product) {
          setData(result);
        }
      })
      .catch(err => {
        console.log('Using mock data, API unavailable:', err.message);
      });
  }, [slug]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center py-16">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          <p className="mt-4 text-gray-600">Loading product...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center py-16">
          <p className="text-red-600 text-lg">{error || 'Product not found'}</p>
        </div>
      </div>
    );
  }

  return (
    <Customizer
      product={data.product}
      variants={data.product.variants}
      decorationMethods={data.decorationMethods}
    />
  );
}
