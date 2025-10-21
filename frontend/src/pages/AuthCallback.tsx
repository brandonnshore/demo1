import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { authAPI } from '../services/api';

export default function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    handleCallback();
  }, []);

  const handleCallback = async () => {
    try {
      // Get the session from Supabase
      const { data: { session }, error } = await supabase.auth.getSession();

      if (error) throw error;

      if (session?.user) {
        // Create or sync user in our backend
        const { email, user_metadata } = session.user;
        const name = user_metadata?.full_name || user_metadata?.name || email?.split('@')[0] || 'User';

        try {
          // Try to register the user (will fail if exists, which is fine)
          await authAPI.register(email!, 'oauth-' + session.user.id, name);
        } catch (err) {
          // User might already exist, that's okay
        }

        // Login with the OAuth user
        // For OAuth users, we'll use a special token
        localStorage.setItem('auth_token', session.access_token);
        localStorage.setItem('auth_provider', 'oauth');

        // Redirect to dashboard
        navigate('/dashboard');
      } else {
        // No session, redirect to login
        navigate('/login');
      }
    } catch (error) {
      console.error('OAuth callback error:', error);
      navigate('/login');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto"></div>
        <p className="mt-4 text-gray-600">Completing sign in...</p>
      </div>
    </div>
  );
}
