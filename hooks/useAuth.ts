// Client-side authentication hook
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export interface User {
  userId: string;
  email: string;
  username: string;
  fullName: string;
  collegeIdUrl?: string;
  verified?: boolean;
  collegeName?: string;
  mobile?: string;
  isAdmin?: boolean;
}

export interface AuthState {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
}

export const useAuth = (redirectToLogin: boolean = false) => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    loading: true,
    isAuthenticated: false,
  });
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/me', {
          credentials: 'include',
          cache: 'no-store',
        });

        if (!response.ok) {
          throw new Error('Auth check failed');
        }

        const data = await response.json();

        if (!data.loggedIn) {
          setAuthState({
            user: null,
            loading: false,
            isAuthenticated: false,
          });

          if (redirectToLogin) {
            router.push('/auth/login');
          }
          return;
        }

        setAuthState({
          user: data.user,
          loading: false,
          isAuthenticated: true,
        });
      } catch (error) {
        console.error('Authentication check failed:', error);
        setAuthState({
          user: null,
          loading: false,
          isAuthenticated: false,
        });

        if (redirectToLogin) {
          router.push('/auth/login');
        }
      }
    };

    checkAuth();

    // Listen for logout events
    const handleLogoutEvent = () => {
      setAuthState({
        user: null,
        loading: false,
        isAuthenticated: false,
      });
    };

    window.addEventListener('userLoggedOut', handleLogoutEvent);

    return () => {
      window.removeEventListener('userLoggedOut', handleLogoutEvent);
    };
  }, [redirectToLogin, router]);

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });

      setAuthState({
        user: null,
        loading: false,
        isAuthenticated: false,
      });

      router.push('/auth/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return {
    ...authState,
    logout,
  };
};