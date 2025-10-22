import { Link } from 'react-router-dom';
import { useState } from 'react';

export default function HowItWorks() {
  const [activeStep, setActiveStep] = useState(0);

  const steps = [
    {
      number: '01',
      title: 'Choose Your Canvas',
      description: 'Select from our curated collection of premium blank apparel. From classic tees to cozy hoodies, we\'ve got the perfect base for your design.',
      icon: '👕',
      color: 'from-blue-500 to-blue-600',
      features: ['Premium quality blanks', 'Multiple product types', 'Various colors & sizes'],
    },
    {
      number: '02',
      title: 'Design Your Vision',
      description: 'Use our intuitive customizer to bring your ideas to life. Upload artwork, add text, choose placements, and see your design in real-time.',
      icon: '🎨',
      color: 'from-purple-500 to-purple-600',
      features: ['Drag & drop editor', 'Real-time preview', 'Multiple decoration methods'],
    },
    {
      number: '03',
      title: 'Get Instant Pricing',
      description: 'Our smart pricing engine calculates your cost on the fly. No hidden fees, no surprises - just transparent, fair pricing based on your customization.',
      icon: '💰',
      color: 'from-green-500 to-green-600',
      features: ['Live price updates', 'Quantity discounts', 'No minimum order'],
    },
    {
      number: '04',
      title: 'Place Your Order',
      description: 'Secure checkout with Stripe. Once confirmed, we generate production-ready files and send them straight to our trusted fulfillment partners.',
      icon: '✨',
      color: 'from-orange-500 to-orange-600',
      features: ['Secure payment', 'Auto-generated files', 'Fast turnaround'],
    },
  ];

  const decorationMethods = [
    { name: 'Screen Printing', desc: 'Bold, vibrant colors for large quantities', icon: '🖨️' },
    { name: 'DTG Printing', desc: 'Photo-quality prints with unlimited colors', icon: '🎯' },
    { name: 'Embroidery', desc: 'Premium texture for a professional look', icon: '🧵' },
    { name: 'Heat Transfer', desc: 'Perfect for complex designs and gradients', icon: '🔥' },
  ];

  return (
    <div className="bg-white min-h-screen">
      {/* Hero Section */}
      <section className="relative pt-24 pb-32 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-20">
            <h1 className="text-5xl lg:text-7xl font-bold leading-tight mb-6">
              How It Works
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              From blank to branded in four simple steps. Creating custom apparel has never been easier.
            </p>
          </div>

          {/* Step-by-step interactive section */}
          <div className="grid lg:grid-cols-2 gap-16 items-start">
            {/* Left: Steps Navigation */}
            <div className="space-y-6 lg:sticky lg:top-24">
              {steps.map((step, index) => (
                <button
                  key={index}
                  onClick={() => setActiveStep(index)}
                  className={`w-full text-left p-6 rounded-2xl transition-all duration-300 ${
                    activeStep === index
                      ? 'bg-black text-white shadow-2xl scale-105'
                      : 'bg-gray-50 hover:bg-gray-100 text-gray-800'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className={`text-4xl ${activeStep === index ? 'animate-bounce' : ''}`}>
                      {step.icon}
                    </div>
                    <div className="flex-1">
                      <div className={`text-sm font-medium mb-2 ${
                        activeStep === index ? 'text-gray-300' : 'text-gray-500'
                      }`}>
                        Step {step.number}
                      </div>
                      <h3 className="text-2xl font-bold mb-2">{step.title}</h3>
                      <p className={`text-sm leading-relaxed ${
                        activeStep === index ? 'text-gray-300' : 'text-gray-600'
                      }`}>
                        {step.description}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>

            {/* Right: Active Step Details */}
            <div className="lg:sticky lg:top-24">
              <div className={`bg-gradient-to-br ${steps[activeStep].color} rounded-3xl p-8 text-white shadow-2xl transition-all duration-500 transform`}>
                <div className="text-8xl mb-6 animate-pulse">{steps[activeStep].icon}</div>
                <div className="text-6xl font-bold mb-4 opacity-20">{steps[activeStep].number}</div>
                <h2 className="text-4xl font-bold mb-6">{steps[activeStep].title}</h2>
                <p className="text-lg mb-8 leading-relaxed opacity-90">
                  {steps[activeStep].description}
                </p>

                <div className="space-y-3">
                  {steps[activeStep].features.map((feature, idx) => (
                    <div key={idx} className="flex items-center gap-3">
                      <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center">
                        <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <span className="text-lg">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Decoration Methods Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold mb-4">
              Choose Your Decoration Method
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Different techniques for different needs. We'll help you pick the perfect method for your design.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {decorationMethods.map((method, idx) => (
              <div
                key={idx}
                className="bg-white rounded-2xl p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-2 cursor-pointer group"
              >
                <div className="text-5xl mb-4 group-hover:scale-110 transition-transform duration-300">
                  {method.icon}
                </div>
                <h3 className="text-xl font-bold mb-2">{method.name}</h3>
                <p className="text-gray-600 text-sm">{method.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-4xl lg:text-5xl font-bold mb-6">
                Why designers love working with us
              </h2>
              <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                We've built our platform from the ground up to make custom apparel creation seamless, transparent, and professional.
              </p>

              <div className="space-y-6">
                {[
                  {
                    title: 'No Minimum Orders',
                    desc: 'Order as few or as many as you need. Perfect for testing designs or small batches.',
                    color: 'green'
                  },
                  {
                    title: 'Real-Time Pricing',
                    desc: 'See costs update instantly as you design. No waiting for quotes or surprises.',
                    color: 'blue'
                  },
                  {
                    title: 'Production-Ready Files',
                    desc: 'We automatically generate all the files your printer needs. No manual work required.',
                    color: 'purple'
                  },
                  {
                    title: 'Fast Turnaround',
                    desc: 'Most orders ship within 3-5 business days. Rush options available.',
                    color: 'orange'
                  },
                ].map((item, idx) => (
                  <div key={idx} className="flex gap-4">
                    <div className={`w-12 h-12 bg-${item.color}-100 rounded-xl flex items-center justify-center flex-shrink-0`}>
                      <svg className={`w-6 h-6 text-${item.color}-600`} fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold mb-1">{item.title}</h3>
                      <p className="text-gray-600">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative">
              <div className="bg-gradient-to-br from-pink-500 to-purple-600 rounded-3xl p-12 text-white shadow-2xl">
                <div className="text-center">
                  <div className="text-6xl mb-6">🚀</div>
                  <h3 className="text-3xl font-bold mb-4">Ready to create?</h3>
                  <p className="text-lg mb-8 opacity-90">
                    Join thousands of creators bringing their designs to life
                  </p>
                  <div className="flex flex-col gap-4">
                    <Link
                      to="/products/classic-tee"
                      className="px-8 py-4 bg-white text-purple-600 font-bold rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      Start Designing Now
                    </Link>
                    <Link
                      to="/products"
                      className="px-8 py-4 border-2 border-white text-white font-bold rounded-lg hover:bg-white/10 transition-colors"
                    >
                      Browse Products
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Timeline Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-4xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold mb-4">
              From Order to Delivery
            </h2>
            <p className="text-lg text-gray-600">
              Here's what happens after you click "Place Order"
            </p>
          </div>

          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gray-300"></div>

            <div className="space-y-12">
              {[
                { time: 'Instant', title: 'Order Confirmed', desc: 'Payment processed and production files generated automatically' },
                { time: '1-2 days', title: 'In Production', desc: 'Your design is printed by our trusted fulfillment partners' },
                { time: '2-3 days', title: 'Quality Check', desc: 'Each item is inspected before packaging' },
                { time: '3-5 days', title: 'Shipped', desc: 'Tracking number sent to your email' },
                { time: '5-7 days', title: 'Delivered', desc: 'Your custom apparel arrives at your door' },
              ].map((item, idx) => (
                <div key={idx} className="relative pl-20">
                  <div className="absolute left-0 w-16 h-16 bg-black rounded-full flex items-center justify-center text-white font-bold shadow-lg">
                    {idx + 1}
                  </div>
                  <div className="bg-white rounded-2xl p-6 shadow-md hover:shadow-xl transition-shadow">
                    <div className="text-sm font-medium text-purple-600 mb-1">{item.time}</div>
                    <h3 className="text-2xl font-bold mb-2">{item.title}</h3>
                    <p className="text-gray-600">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold mb-4">
              Common Questions
            </h2>
          </div>

          <div className="space-y-4">
            {[
              { q: 'What file formats do you accept?', a: 'We accept PNG, JPG, SVG, and PDF files. For best results, use high-resolution images (300 DPI or higher).' },
              { q: 'Can I order just one item?', a: 'Absolutely! There are no minimum order quantities. Order as few or as many as you need.' },
              { q: 'How long does production take?', a: 'Most orders are produced and shipped within 3-5 business days. Rush options are available for faster delivery.' },
              { q: 'What if I need help with my design?', a: 'Our design support team is here to help! Contact us and we\'ll assist with file preparation and design advice.' },
            ].map((item, idx) => (
              <details key={idx} className="bg-gray-50 rounded-xl p-6 hover:bg-gray-100 transition-colors group">
                <summary className="text-xl font-bold cursor-pointer flex justify-between items-center">
                  {item.q}
                  <span className="text-2xl group-open:rotate-180 transition-transform">↓</span>
                </summary>
                <p className="text-gray-600 mt-4 leading-relaxed">{item.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 bg-black text-white">
        <div className="max-w-4xl mx-auto px-6 lg:px-8 text-center">
          <h2 className="text-4xl lg:text-6xl font-bold mb-6">
            Ready to bring your ideas to life?
          </h2>
          <p className="text-xl text-gray-300 mb-10">
            Start designing in minutes. No experience required.
          </p>
          <Link
            to="/products/classic-tee"
            className="inline-block px-10 py-5 bg-white text-black text-lg font-bold rounded-lg hover:bg-gray-100 transition-colors"
          >
            Start Your First Design
          </Link>
        </div>
      </section>
    </div>
  );
}
