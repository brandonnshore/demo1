import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { authAPI } from '../services/api';

export default function AuthCallback() {
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

        // Sync the OAuth user with our backend (this sets the auth token in localStorage)
        await authAPI.oauthSync(email!, name, session.user.id);

        // Redirect to dashboard (full page reload will load the user from the token)
        window.location.href = '/dashboard';
      } else {
        console.error('No session found');
        setError('No session found. Please try again.');
        setTimeout(() => window.location.href = '/login', 2000);
      }
    } catch (error: any) {
      console.error('OAuth callback error:', error);
      setError(error.message || 'Authentication failed. Please try again.');
      setTimeout(() => window.location.href = '/login', 2000);
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
