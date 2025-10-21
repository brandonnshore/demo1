import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { productAPI } from '../services/api';
import { Product } from '../types';

export default function Products() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Load mock data immediately for instant display
    const mockProducts = [
      {
        id: '1',
        title: 'Classic Cotton T-Shirt',
        slug: 'classic-tee',
        description: 'Premium 100% cotton t-shirt',
        images: ['/assets/blank-tshirt.png'],
        status: 'active' as const,
        variants: [
          { id: '1', product_id: '1', color: 'White', size: 'M', sku: 'TEE-WHT-M', base_price: 12.99, stock_level: 100 }
        ]
      }
    ];

    setProducts(mockProducts);
    setLoading(false);

    // Try to fetch real data in background, but don't wait for it
    productAPI.getAll()
      .then(data => {
        if (data && data.length > 0) {
          setProducts(data);
        }
      })
      .catch(err => {
        console.log('Using mock data, API unavailable:', err.message);
      });
  }, []);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center py-16">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          <p className="mt-4 text-gray-600">Loading products...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center py-16">
          <p className="text-red-600 text-lg">{error}</p>
          <p className="text-gray-500 mt-4">
            Make sure the backend server is running and the database is set up.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold mb-2">Choose from our</h1>
          <h1 className="text-4xl font-bold">products</h1>
        </div>

        {products.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-500 text-base">No products available</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-12">
            {products.map((product) => (
              <Link
                key={product.id}
                to={`/products/${product.slug}`}
                className="group block"
              >
                {/* Product Image */}
                <div className="mb-4 overflow-hidden -mx-4">
                  <div className="aspect-[4/5] flex items-center justify-center">
                    {product.images && product.images.length > 0 ? (
                      <img
                        src={product.images[0]}
                        alt={product.title}
                        className="w-full h-full object-contain group-hover:scale-[1.02] transition-transform duration-500"
                        style={{ imageRendering: 'high-quality' }}
                        onError={(e) => {
                          e.currentTarget.src = '/assets/blank-tshirt.png';
                        }}
                      />
                    ) : (
                      <img
                        src="/assets/blank-tshirt.png"
                        alt={product.title}
                        className="w-full h-full object-contain group-hover:scale-[1.02] transition-transform duration-500"
                        style={{ imageRendering: 'high-quality' }}
                      />
                    )}
                  </div>
                </div>

                {/* Product Info - Centered */}
                <div className="text-center">
                  <h3 className="text-sm font-medium mb-1">{product.title}</h3>
                  {product.variants && product.variants.length > 0 && (
                    <p className="text-sm text-gray-600">
                      from €{Number(product.variants[0].base_price).toFixed(2)}
                    </p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
