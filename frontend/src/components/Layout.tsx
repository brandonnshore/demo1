import { Link, useLocation } from 'react-router-dom';
import { ShoppingCart, User } from 'lucide-react';
import { useCartStore } from '../stores/cartStore';
import { useAuth } from '../contexts/AuthContext';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const cartItemCount = useCartStore((state) => state.items.length);
  const location = useLocation();
  const { isAuthenticated, user } = useAuth();

  // Hide header on product detail/customizer pages
  const hideHeader = location.pathname.startsWith('/products/') && location.pathname !== '/products';

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Header - Assembly style */}
      {!hideHeader && (
        <header className="bg-white sticky top-0 z-50">
        <nav className="max-w-7xl mx-auto px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link to="/" className="text-2xl font-bold text-gray-900">
            Raspberry
          </Link>

          <div className="hidden md:flex items-center gap-8">
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

          <div className="flex items-center gap-4">
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
                className="flex items-center gap-2 text-sm text-gray-900 hover:text-gray-600 transition-colors"
              >
                <User size={18} />
                <span className="hidden sm:inline">{user?.name}</span>
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
        </nav>
      </header>
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
