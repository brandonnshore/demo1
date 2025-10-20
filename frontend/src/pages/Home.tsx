import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { productAPI } from '../services/api';
import { Product } from '../types';

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const data = await productAPI.getAll();
        setProducts(data.slice(0, 6)); // Show first 6 products for stacking
      } catch (err) {
        console.error('Failed to load products:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  return (
    <div className="bg-white min-h-screen">
      {/* Hero Section */}
      <section className="h-screen flex items-center">
        <div className="w-full grid lg:grid-cols-2 gap-0">
          {/* Left: Hero Text */}
          <div className="flex items-center justify-center px-12 lg:px-20">
            <div className="max-w-lg">
              <h1 className="text-5xl lg:text-6xl font-bold leading-tight mb-6">
                Create and sell premium custom clothes easily
              </h1>
              <p className="text-lg text-gray-600 leading-relaxed mb-8">
                Design, customize, and order high-quality apparel with our intuitive customization studio.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  to="/products"
                  className="px-6 py-3 bg-black text-white text-sm font-medium rounded-md hover:bg-gray-800 transition-colors text-center"
                >
                  Start Designing
                </Link>
                <Link
                  to="/products"
                  className="px-6 py-3 border border-gray-300 text-gray-700 text-sm font-medium rounded-md hover:bg-gray-50 transition-colors text-center"
                >
                  View Products
                </Link>
              </div>

              {/* Feature badges */}
              <div className="mt-10 grid grid-cols-2 gap-4 text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center">
                    <svg className="w-3 h-3 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span className="text-gray-600">No MOQ</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center">
                    <svg className="w-3 h-3 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span className="text-gray-600">High quality DTG</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 bg-purple-100 rounded-full flex items-center justify-center">
                    <svg className="w-3 h-3 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span className="text-gray-600">Fast turnaround</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 bg-orange-100 rounded-full flex items-center justify-center">
                    <svg className="w-3 h-3 text-orange-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span className="text-gray-600">100% organic cotton</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Stacked Product Images */}
          <div className="relative h-screen overflow-hidden bg-gray-50">
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
              </div>
            ) : (
              <div className="absolute inset-0 flex flex-col justify-center py-8">
                {products.map((product, index) => (
                  <Link
                    key={product.id}
                    to={`/products/${product.slug}`}
                    className="block relative"
                    style={{
                      transform: `rotate(${(index - 2.5) * 3}deg) translateY(${(index - 2.5) * -10}px)`,
                      zIndex: products.length - index,
                      marginBottom: index < products.length - 1 ? '-280px' : '0'
                    }}
                  >
                    <div className="mx-auto w-[400px] bg-white shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-105 hover:z-50 rounded-lg overflow-hidden">
                      <div className="aspect-[3/4] bg-white flex items-center justify-center p-8">
                        {product.images && product.images.length > 0 ? (
                          <img
                            src={product.images[0]}
                            alt={product.title}
                            className="w-full h-full object-contain"
                            onError={(e) => {
                              e.currentTarget.src = '/assets/blank-tshirt.png';
                            }}
                          />
                        ) : (
                          <img
                            src="/assets/blank-tshirt.png"
                            alt={product.title}
                            className="w-full h-full object-contain"
                          />
                        )}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
