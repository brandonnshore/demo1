import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { authAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

export default function AuthCallback() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [error, setError] = useState<string>('');

  useEffect(() => {
    handleCallback();
  }, []);

  const handleCallback = async () => {
    try {
      // Get the session from Supabase
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();

      if (sessionError) {
        console.error('Session error:', sessionError);
        throw sessionError;
      }

      if (session?.user) {
        const { email, user_metadata } = session.user;
        const name = user_metadata?.full_name || user_metadata?.name || email?.split('@')[0] || 'User';

        try {
          // Try to register the user in our backend (will fail if exists, which is fine)
          await authAPI.register(email!, 'oauth-' + session.user.id, name);
        } catch (err: any) {
          // User might already exist, that's okay - try to login instead
        }

        // Now login with email and the OAuth password
        try {
          await login(email!, 'oauth-' + session.user.id);
          // Redirect to dashboard
          navigate('/dashboard');
        } catch (loginErr: any) {
          console.error('Login error:', loginErr);
          // If login fails, store the Supabase token directly
          localStorage.setItem('auth_token', session.access_token);
          localStorage.setItem('oauth_user', JSON.stringify({
            id: session.user.id,
            email: email!,
            name
          }));
          window.location.href = '/dashboard';
        }
      } else {
        console.error('No session found');
        setError('No session found. Please try again.');
        setTimeout(() => navigate('/login'), 2000);
      }
    } catch (error: any) {
      console.error('OAuth callback error:', error);
      setError(error.message || 'Authentication failed. Please try again.');
      setTimeout(() => navigate('/login'), 2000);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        {error ? (
          <>
            <div className="text-red-600 mb-4">{error}</div>
            <p className="text-gray-600">Redirecting to login...</p>
          </>
        ) : (
          <>
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto"></div>
            <p className="mt-4 text-gray-600">Completing sign in...</p>
          </>
        )}
      </div>
    </div>
  );
}
