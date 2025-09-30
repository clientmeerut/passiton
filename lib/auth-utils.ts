// Authentication utility functions for client-side use
import React from 'react';

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

export interface AuthResponse {
  loggedIn: boolean;
  isAdmin: boolean;
  user?: User;
}

export const checkAuth = async (): Promise<AuthResponse> => {
  try {
    const response = await fetch('/api/auth/me', {
      credentials: 'include',
      cache: 'no-store'
    });

    if (!response.ok) {
      return { loggedIn: false, isAdmin: false };
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Auth check failed:', error);
    return { loggedIn: false, isAdmin: false };
  }
};

export const logout = async (): Promise<boolean> => {
  try {
    const response = await fetch('/api/auth/logout', {
      method: 'POST',
      credentials: 'include'
    });

    return response.ok;
  } catch (error) {
    console.error('Logout failed:', error);
    return false;
  }
};

export const withAuth = <P extends object>(WrappedComponent: React.ComponentType<P>) => {
  const AuthenticatedComponent: React.FC<P> = (props: P) => {
    // This would be a higher-order component for protecting routes
    // For now, we'll handle auth checks in individual components
    return React.createElement(WrappedComponent, props);
  };

  return AuthenticatedComponent;
};