import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { productAPI } from '../services/api';
import { Product } from '../types';

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');

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

  const categories = ['T-Shirts', 'Hoodies', 'Sportswear', 'Hats & Bags', 'Women'];
  const productColors = ['#000000', '#1e3a8a', '#6b7280', '#ffffff', '#7c2d12'];

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
                  to="/products/classic-tee"
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

          {/* Right: Product Image */}
          <div className="relative h-screen overflow-hidden bg-white">
            <div className="absolute inset-0 flex items-center justify-start -ml-10">
              <img
                src="/assets/pink-hoodie-model.jpeg"
                alt="Product model"
                className="h-full w-auto object-contain"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Product Showcase Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-12">
            <h2 className="text-4xl lg:text-5xl font-bold mb-4">
              Beautiful bestselling blanks,<br />ready for your vision
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto mb-8">
              Specially curated high-quality garments perfect for your custom designs. Start with our premium basics and bring your creative vision to life.
            </p>

            {/* Category Filters */}
            <div className="flex flex-wrap justify-center gap-2 mb-4">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                    selectedCategory === category
                      ? 'bg-black text-white'
                      : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {category}
                </button>
              ))}
              <button
                onClick={() => setSelectedCategory('All')}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                  selectedCategory === 'All'
                    ? 'bg-black text-white'
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                }`}
              >
                All products
              </button>
            </div>
          </div>

          {/* Product Grid */}
          {loading ? (
            <div className="text-center py-20">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-x-6 gap-y-12">
              {products.slice(0, 5).map((product) => (
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

                  {/* Color dots */}
                  <div className="flex justify-center gap-1.5 mb-2">
                    {productColors.map((color, i) => (
                      <div
                        key={i}
                        className="w-3 h-3 rounded-full border border-gray-300"
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>

                  {/* Product info */}
                  <div className="text-center">
                    <p className="text-sm font-medium mb-1">{product.title}</p>
                    <p className="text-sm text-gray-600">from $12.98</p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Trusted By Section - Scrolling Logos */}
      <section className="py-16 bg-white overflow-hidden relative">
        {/* Fixed "Trusted by" text on the left with background and fade */}
        <div className="absolute left-0 top-1/2 -translate-y-1/2 z-20 flex items-center">
          <div className="bg-white px-8 py-4 relative z-10">
            <h3 className="text-4xl font-bold">Trusted by</h3>
          </div>
          {/* Fade gradient extending to the right behind the text */}
          <div className="absolute left-0 top-0 bottom-0 w-96 bg-gradient-to-r from-white via-white to-transparent pointer-events-none"></div>
        </div>

        {/* Scrolling logos container */}
        <div className="relative">
          <div className="flex animate-scroll">
              {/* First set of logos */}
              <div className="flex items-center gap-16 min-w-max pr-16">
                <div className="text-2xl font-bold text-gray-800">UNIVERSAL<br/>MUSIC GROUP</div>
                <div className="text-2xl font-bold text-gray-800" style={{ letterSpacing: '0.2em' }}>DINAMO</div>
                <div className="text-2xl font-bold text-gray-800">believe.</div>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center">
                    <div className="w-6 h-6 border-2 border-white rounded-full"></div>
                  </div>
                  <div className="text-xl font-medium text-gray-800">Index<br/>Ventures</div>
                </div>
              </div>

              {/* Second set */}
              <div className="flex items-center gap-16 min-w-max pr-16">
                <div className="text-2xl font-bold text-gray-800">UNIVERSAL<br/>MUSIC GROUP</div>
                <div className="text-2xl font-bold text-gray-800" style={{ letterSpacing: '0.2em' }}>DINAMO</div>
                <div className="text-2xl font-bold text-gray-800">believe.</div>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center">
                    <div className="w-6 h-6 border-2 border-white rounded-full"></div>
                  </div>
                  <div className="text-xl font-medium text-gray-800">Index<br/>Ventures</div>
                </div>
              </div>

              {/* Third set */}
              <div className="flex items-center gap-16 min-w-max pr-16">
                <div className="text-2xl font-bold text-gray-800">UNIVERSAL<br/>MUSIC GROUP</div>
                <div className="text-2xl font-bold text-gray-800" style={{ letterSpacing: '0.2em' }}>DINAMO</div>
                <div className="text-2xl font-bold text-gray-800">believe.</div>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center">
                    <div className="w-6 h-6 border-2 border-white rounded-full"></div>
                  </div>
                  <div className="text-xl font-medium text-gray-800">Index<br/>Ventures</div>
                </div>
              </div>

              {/* Fourth set */}
              <div className="flex items-center gap-16 min-w-max pr-16">
                <div className="text-2xl font-bold text-gray-800">UNIVERSAL<br/>MUSIC GROUP</div>
                <div className="text-2xl font-bold text-gray-800" style={{ letterSpacing: '0.2em' }}>DINAMO</div>
                <div className="text-2xl font-bold text-gray-800">believe.</div>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center">
                    <div className="w-6 h-6 border-2 border-white rounded-full"></div>
                  </div>
                  <div className="text-xl font-medium text-gray-800">Index<br/>Ventures</div>
                </div>
              </div>
            </div>
          </div>
      </section>
    </div>
  );
}
