import { useState } from 'react';
import { Link } from 'react-router-dom';

interface CaseStudy {
  id: string;
  brand: string;
  image: string;
  color: string;
  product: string;
  quantity: number;
  method: string;
  description: string;
  tags: string[];
}

export default function CaseStudies() {
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);

  const caseStudies: CaseStudy[] = [
    {
      id: '1',
      brand: 'TRESOR',
      image: '/assets/case-study-tresor.jpg',
      color: 'Black',
      product: 'Classic T-Shirt',
      quantity: 150,
      method: 'Screen print',
      description: 'Berlin-based techno club TRESOR wanted high-quality merch that matched their iconic brand. We delivered premium black tees with crisp white prints.',
      tags: ['Music', 'Events', 'Nightlife']
    },
    {
      id: '2',
      brand: 'apartamento',
      image: '/assets/pink-hoodie-model.jpeg',
      color: 'Navy',
      product: 'Classic T-Shirt',
      quantity: 270,
      method: 'Screen print',
      description: 'The Apartamento team wanted to launch some high quality merchandise to complement their magazine\'s premium visuals and expert curation.',
      tags: ['Magazine', 'Publishing', 'Lifestyle']
    },
    {
      id: '3',
      brand: 'Art Basel',
      image: '/assets/blank-tshirt.png',
      color: 'White',
      product: 'Tote Bag',
      quantity: 500,
      method: 'Screen print',
      description: 'Art Basel needed sustainable merch for their annual fair. We created eco-friendly tote bags that became a hit with collectors and artists alike.',
      tags: ['Art', 'Events', 'Premium']
    },
    {
      id: '4',
      brand: 'Studio Hato',
      image: '/assets/pink-hoodie-model.jpeg',
      color: 'Forest Green',
      product: 'Hoodie',
      quantity: 85,
      method: 'Embroidery',
      description: 'London design studio needed premium team wear. We delivered heavyweight hoodies with custom embroidered logos for a professional finish.',
      tags: ['Design', 'Studio', 'Team Wear']
    },
    {
      id: '5',
      brand: 'Kinfolk',
      image: '/assets/blank-tshirt.png',
      color: 'Bone',
      product: 'Classic T-Shirt',
      quantity: 320,
      method: 'DTG',
      description: 'Kinfolk magazine wanted subtle, high-quality merch that reflected their minimalist aesthetic. Our DTG printing captured every detail perfectly.',
      tags: ['Magazine', 'Minimal', 'Lifestyle']
    },
    {
      id: '6',
      brand: 'Soho House',
      image: '/assets/pink-hoodie-model.jpeg',
      color: 'Black',
      product: 'Polo Shirt',
      quantity: 200,
      method: 'Embroidery',
      description: 'Soho House needed elevated staff uniforms across their global locations. We provided consistent quality with embroidered polos.',
      tags: ['Hospitality', 'Uniforms', 'Premium']
    }
  ];

  return (
    <div className="bg-white min-h-screen">
      {/* Hero Section */}
      <section className="pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="max-w-3xl">
            <h1 className="text-5xl lg:text-7xl font-bold leading-tight mb-6">
              Case Studies
            </h1>
            <p className="text-xl text-gray-600 leading-relaxed">
              See how leading brands, studios, and creators use Raspberry to bring their custom apparel vision to life.
            </p>
          </div>
        </div>
      </section>

      {/* Case Studies Grid */}
      <section className="pb-20">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {caseStudies.map((study) => (
              <div
                key={study.id}
                className="relative group cursor-pointer"
                onMouseEnter={() => setHoveredCard(study.id)}
                onMouseLeave={() => setHoveredCard(null)}
              >
                {/* Card */}
                <div className="relative rounded-3xl overflow-hidden bg-gray-900 aspect-[3/4]">
                  {/* Background Image */}
                  <img
                    src={study.image}
                    alt={study.brand}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    onError={(e) => {
                      e.currentTarget.src = '/assets/blank-tshirt.png';
                    }}
                  />

                  {/* Tags at top - always visible */}
                  <div className="absolute top-6 left-6 right-6 flex flex-wrap gap-2 z-10">
                    <span className="px-3 py-1.5 bg-white rounded-full text-xs font-medium text-gray-900">
                      {study.color}
                    </span>
                    <span className="px-3 py-1.5 bg-white rounded-full text-xs font-medium text-gray-900">
                      {study.product} - {study.quantity}
                    </span>
                    <span className="px-3 py-1.5 bg-white rounded-full text-xs font-medium text-gray-900">
                      {study.method}
                    </span>
                  </div>

                  {/* Brand name at bottom - always visible */}
                  <div className="absolute bottom-6 left-6 right-6 z-10">
                    <h3 className="text-white text-3xl font-bold">
                      {study.brand}
                    </h3>
                  </div>

                  {/* Hover info panel - slides up from bottom */}
                  <div
                    className={`absolute left-0 right-0 bottom-0 bg-[#d4c5b0] p-6 transition-transform duration-500 ease-out ${
                      hoveredCard === study.id
                        ? 'translate-y-0'
                        : 'translate-y-full'
                    }`}
                  >
                    <h3 className="text-2xl font-bold mb-3 text-gray-900">
                      {study.brand}
                    </h3>
                    <p className="text-gray-800 text-sm leading-relaxed mb-4">
                      {study.description}
                    </p>
                    <button className="flex items-center gap-2 text-gray-900 font-medium text-sm hover:gap-3 transition-all">
                      Read more
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-4xl mx-auto px-6 lg:px-8 text-center">
          <h2 className="text-4xl lg:text-5xl font-bold mb-6">
            Ready to create your own success story?
          </h2>
          <p className="text-xl text-gray-600 mb-10">
            Join hundreds of brands and creators who trust Raspberry for their custom apparel needs.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/products/classic-tee"
              className="px-8 py-4 bg-black text-white text-lg font-medium rounded-full hover:bg-gray-800 transition-colors"
            >
              Start Your Project
            </Link>
            <Link
              to="/how-it-works"
              className="px-8 py-4 border-2 border-gray-300 text-gray-900 text-lg font-medium rounded-full hover:bg-gray-100 transition-colors"
            >
              How It Works
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-black text-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-12 text-center">
            <div>
              <div className="text-5xl font-bold mb-2">500+</div>
              <div className="text-gray-400">Brands served</div>
            </div>
            <div>
              <div className="text-5xl font-bold mb-2">50K+</div>
              <div className="text-gray-400">Items produced</div>
            </div>
            <div>
              <div className="text-5xl font-bold mb-2">4.9/5</div>
              <div className="text-gray-400">Customer rating</div>
            </div>
            <div>
              <div className="text-5xl font-bold mb-2">24h</div>
              <div className="text-gray-400">Avg. response time</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
