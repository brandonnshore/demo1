import { Link, useLocation } from 'react-router-dom';
import { ShoppingCart, Menu, X } from 'lucide-react';
import { useCartStore } from '../stores/cartStore';
import { useAuth } from '../contexts/AuthContext';
import { useState } from 'react';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const cartItemCount = useCartStore((state) => state.items.length);
  const location = useLocation();
  const { isAuthenticated, user } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Hide header on product detail/customizer pages
  const hideHeader = (location.pathname.startsWith('/products/') && location.pathname !== '/products') || location.pathname === '/hoodie';

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Header - Assembly style */}
      {!hideHeader && (
        <>
          <header className="bg-white sticky top-0 z-50 border-b border-gray-200">
            <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between relative">
              <Link to="/" className="text-xl sm:text-2xl font-bold text-gray-900">
                Raspberry
              </Link>

              {/* Desktop Navigation */}
              <div className="hidden md:flex items-center gap-8 absolute left-1/2 -translate-x-1/2">
                <Link to="/products" className="text-sm text-gray-900 hover:text-gray-600 transition-colors">
                  Products
                </Link>
                <Link to="/how-it-works" className="text-sm text-gray-900 hover:text-gray-600 transition-colors">
                  How it works
                </Link>
                <Link to="/about" className="text-sm text-gray-900 hover:text-gray-600 transition-colors">
                  Pricing & Service
                </Link>
                <Link to="/case-studies" className="text-sm text-gray-900 hover:text-gray-600 transition-colors">
                  Case Studies
                </Link>
                <Link to="/about" className="text-sm text-gray-900 hover:text-gray-600 transition-colors">
                  Blog
                </Link>
              </div>

              {/* Desktop Right Side */}
              <div className="hidden md:flex items-center gap-4">
                <Link to="/cart" className="relative text-gray-900 hover:text-gray-600 transition-colors">
                  <ShoppingCart size={20} />
                  {cartItemCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-black text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {cartItemCount}
                    </span>
                  )}
                </Link>
                {isAuthenticated ? (
                  <Link
                    to="/dashboard"
                    className="w-8 h-8 rounded-full bg-gray-900 text-white flex items-center justify-center text-sm font-medium hover:bg-gray-700 transition-colors"
                  >
                    {user?.name?.charAt(0).toUpperCase() || 'U'}
                  </Link>
                ) : (
                  <Link
                    to="/login"
                    className="text-sm text-gray-900 hover:text-gray-600 transition-colors"
                  >
                    Login
                  </Link>
                )}
                <Link
                  to="/products"
                  className="px-5 py-2.5 bg-black text-white text-sm font-medium rounded-full hover:bg-gray-800 transition-colors"
                >
                  Start designing
                </Link>
              </div>

              {/* Mobile Right Side */}
              <div className="flex md:hidden items-center gap-3">
                <Link to="/cart" className="relative text-gray-900 p-2">
                  <ShoppingCart size={22} />
                  {cartItemCount > 0 && (
                    <span className="absolute top-0 right-0 bg-black text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {cartItemCount}
                    </span>
                  )}
                </Link>
                <button
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="p-2 text-gray-900"
                  aria-label="Toggle menu"
                >
                  {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
              </div>
            </nav>
          </header>

          {/* Mobile Menu Overlay */}
          {mobileMenuOpen && (
            <div className="fixed inset-0 z-40 md:hidden">
              <div className="fixed inset-0 bg-black/50" onClick={() => setMobileMenuOpen(false)} />
              <div className="fixed top-16 right-0 bottom-0 w-64 bg-white shadow-xl">
                <nav className="flex flex-col p-6 gap-6">
                  <Link
                    to="/products"
                    className="text-base font-medium text-gray-900"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Products
                  </Link>
                  <Link
                    to="/how-it-works"
                    className="text-base font-medium text-gray-900"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    How it works
                  </Link>
                  <Link
                    to="/about"
                    className="text-base font-medium text-gray-900"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Pricing & Service
                  </Link>
                  <Link
                    to="/case-studies"
                    className="text-base font-medium text-gray-900"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Case Studies
                  </Link>
                  <Link
                    to="/about"
                    className="text-base font-medium text-gray-900"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Blog
                  </Link>

                  <div className="border-t border-gray-200 pt-6 space-y-4">
                    {isAuthenticated ? (
                      <Link
                        to="/dashboard"
                        className="block py-2 text-base font-medium text-gray-900"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        Dashboard
                      </Link>
                    ) : (
                      <Link
                        to="/login"
                        className="block py-2 text-base font-medium text-gray-900"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        Login
                      </Link>
                    )}
                    <Link
                      to="/products"
                      className="block w-full py-3 bg-black text-white text-center text-sm font-medium rounded-full hover:bg-gray-800 transition-colors"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Start designing
                    </Link>
                  </div>
                </nav>
              </div>
            </div>
          )}
        </>
      )}

      {/* Main Content */}
      <main className="flex-1">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 mt-auto">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center">
            <p className="text-gray-400 text-sm">
              &copy; {new Date().getFullYear()} Raspberry. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
