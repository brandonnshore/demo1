import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { productAPI } from '../services/api';
import Customizer from '../components/Customizer';

export default function ProductDetail() {
  const { slug } = useParams();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProduct = async () => {
      if (!slug) return;

      try {
        const result = await productAPI.getBySlug(slug);
        setData(result);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to load product');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
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
