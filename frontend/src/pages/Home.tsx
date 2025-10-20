import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { productAPI } from '../services/api';
import { Product } from '../types';

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [styleFilter, setStyleFilter] = useState('All styles');
  const [fitFilter, setFitFilter] = useState('All fits');

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const data = await productAPI.getAll();
        setProducts(data.slice(0, 4)); // Show only first 4 products
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
      {/* Main Hero Section - Assembly Style */}
      <section className="max-w-7xl mx-auto px-6 lg:px-8 py-16 lg:py-24">
        <div className="grid lg:grid-cols-[1fr_1.2fr] gap-16 items-start">
          {/* Left: Hero Text */}
          <div className="pt-4">
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-6">Get started</p>
            <h1 className="text-5xl lg:text-6xl font-bold leading-tight mb-8">
              Order your product today
            </h1>
            <p className="text-base text-gray-600 leading-relaxed max-w-md">
              Our garments are classic unisex fits all made in Portugal with 100% organic cotton.
              Order a sample to try before you buy, and design your full order in the Assembly Studio.
            </p>
          </div>

          {/* Right: Product Cards */}
          <div>
            {/* Filter Dropdowns */}
            <div className="flex gap-3 mb-8">
              <div className="relative flex-1">
                <select
                  value={styleFilter}
                  onChange={(e) => setStyleFilter(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-md bg-white text-sm appearance-none cursor-pointer focus:outline-none focus:border-gray-900"
                >
                  <option>Style</option>
                  <option>All</option>
                  <option>T-Shirts</option>
                  <option>Hoodies</option>
                  <option>Accessories</option>
                </select>
              </div>
              <div className="relative flex-1">
                <select
                  value={fitFilter}
                  onChange={(e) => setFitFilter(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-md bg-white text-sm appearance-none cursor-pointer focus:outline-none focus:border-gray-900"
                >
                  <option>Fit</option>
                  <option>All</option>
                  <option>Regular</option>
                  <option>Slim</option>
                  <option>Oversized</option>
                </select>
              </div>
            </div>

            {/* Product Grid */}
            {loading ? (
              <div className="text-center py-20">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-6">
                {products.map((product) => (
                  <Link
                    key={product.id}
                    to={`/products/${product.slug}`}
                    className="group block bg-gray-50 rounded-lg overflow-hidden hover:bg-gray-100 transition-all"
                  >
                    <div className="aspect-[3/4] bg-gray-100 flex items-center justify-center overflow-hidden p-8">
                      {product.images && product.images.length > 0 ? (
                        <img
                          src={product.images[0]}
                          alt={product.title}
                          className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500"
                          onError={(e) => {
                            e.currentTarget.src = '/assets/blank-tshirt.png';
                          }}
                        />
                      ) : (
                        <img
                          src="/assets/blank-tshirt.png"
                          alt={product.title}
                          className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500"
                        />
                      )}
                    </div>
                    <div className="p-4 text-center">
                      <h3 className="font-medium text-sm mb-1">{product.title}</h3>
                      {product.variants && product.variants.length > 0 && (
                        <p className="text-xs text-gray-500">
                          from {Number(product.variants[0].base_price).toFixed(2)}€
                        </p>
                      )}
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
