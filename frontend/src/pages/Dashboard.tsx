import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { designAPI } from '../services/api';

interface SavedDesign {
  id: string;
  name: string;
  product_title: string;
  product_slug: string;
  thumbnail_url?: string;
  created_at: string;
  updated_at: string;
}

export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [designs, setDesigns] = useState<SavedDesign[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadDesigns();
  }, []);

  const loadDesigns = async () => {
    try {
      const data = await designAPI.getAll();
      setDesigns(data);
    } catch (err: any) {
      setError('Failed to load your designs');
      console.error('Error loading designs:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteDesign = async (id: string) => {
    if (!confirm('Are you sure you want to delete this design?')) {
      return;
    }

    try {
      await designAPI.delete(id);
      setDesigns(designs.filter(d => d.id !== id));
    } catch (err) {
      alert('Failed to delete design');
      console.error('Error deleting design:', err);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold">My Dashboard</h1>
          <p className="text-gray-600 mt-2">Welcome back, {user?.name}!</p>
        </div>
        <button
          onClick={handleLogout}
          className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
        >
          Logout
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h3 className="text-sm font-medium text-gray-500">Saved Designs</h3>
          <p className="text-3xl font-bold mt-2">{designs.length}</p>
        </div>
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h3 className="text-sm font-medium text-gray-500">Orders</h3>
          <p className="text-3xl font-bold mt-2">0</p>
          <p className="text-xs text-gray-500 mt-1">Coming soon</p>
        </div>
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h3 className="text-sm font-medium text-gray-500">Account</h3>
          <p className="text-sm mt-2">{user?.email}</p>
        </div>
      </div>

      {/* Saved Designs Section */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Your Saved Designs</h2>
          <Link
            to="/products"
            className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800"
          >
            Create New Design
          </Link>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading your designs...</p>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        ) : designs.length === 0 ? (
          <div className="text-center py-12">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <h3 className="mt-2 text-lg font-medium text-gray-900">No designs yet</h3>
            <p className="mt-1 text-gray-500">Get started by creating your first custom design!</p>
            <div className="mt-6">
              <Link
                to="/products"
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-black hover:bg-gray-800"
              >
                Start Designing
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {designs.map((design) => (
              <div
                key={design.id}
                className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
              >
                <div className="aspect-square bg-gray-100 flex items-center justify-center relative overflow-hidden">
                  {/* Always show placeholder as background */}
                  <svg
                    className="absolute h-20 w-20 text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>

                  {/* Thumbnail image on top if available */}
                  {design.thumbnail_url && (
                    <img
                      src={design.thumbnail_url.startsWith('http') ? design.thumbnail_url : `http://localhost:3001${design.thumbnail_url}`}
                      alt={design.name}
                      className="relative w-full h-full object-contain bg-white"
                      onLoad={() => {
                        // Thumbnail loaded successfully
                      }}
                      onError={(e) => {
                        console.error('Thumbnail failed to load:', design.thumbnail_url);
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  )}
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-lg">{design.name}</h3>
                  <p className="text-sm text-gray-500">{design.product_title}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    Updated {new Date(design.updated_at).toLocaleDateString()}
                  </p>
                  <div className="mt-4 flex gap-2">
                    <Link
                      to={`/products/${design.product_slug}?designId=${design.id}`}
                      className="flex-1 text-center px-3 py-2 bg-black text-white text-sm rounded hover:bg-gray-800"
                    >
                      Edit
                    </Link>
                    <button
                      onClick={() => handleDeleteDesign(design.id)}
                      className="px-3 py-2 border border-gray-300 text-sm rounded hover:bg-gray-50"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
