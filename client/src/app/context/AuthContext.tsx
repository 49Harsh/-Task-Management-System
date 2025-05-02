'use client';

import { createContext, useState, useEffect, ReactNode } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import { useRouter } from 'next/navigation';

// Define types
type User = {
  id: string;
  name: string;
  email: string;
};

type AuthContextType = {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
};

// Create context
export const AuthContext = createContext<AuthContextType>({
  user: null,
  token: null,
  isAuthenticated: false,
  loading: true,
  login: async () => {},
  register: async () => {},
  logout: () => {},
});

// Provider component
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Initialize auth state from localStorage
  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    
    if (storedToken) {
      try {
        const decoded = jwtDecode<{ user: { id: string } }>(storedToken);
        setToken(storedToken);
        loadUser(storedToken);
      } catch (error) {
        localStorage.removeItem('token');
        setLoading(false);
      }
    } else {
      setLoading(false);
    }
  }, []);

  // Load user data using the token
  const loadUser = async (authToken: string) => {
    try {
      // Set token in axios defaults
      axios.defaults.headers.common['x-auth-token'] = authToken;

      const res = await axios.get('http://localhost:5000/api/auth/user');
      
      setUser(res.data);
      setIsAuthenticated(true);
      setLoading(false);
    } catch (error) {
      localStorage.removeItem('token');
      setToken(null);
      setUser(null);
      setIsAuthenticated(false);
      setLoading(false);
    }
  };

  // Register user
  const register = async (name: string, email: string, password: string) => {
    try {
      const res = await axios.post('http://localhost:5000/api/auth/register', {
        name,
        email,
        password
      });

      if (res.data.token) {
        localStorage.setItem('token', res.data.token);
        setToken(res.data.token);
        await loadUser(res.data.token);
        router.push('/dashboard');
      }
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Registration failed');
    }
  };

  // Login user
  const login = async (email: string, password: string) => {
    try {
      const res = await axios.post('http://localhost:5000/api/auth/login', {
        email,
        password
      });

      if (res.data.token) {
        localStorage.setItem('token', res.data.token);
        setToken(res.data.token);
        await loadUser(res.data.token);
        router.push('/dashboard');
      }
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Login failed');
    }
  };

  // Logout
  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    setIsAuthenticated(false);
    delete axios.defaults.headers.common['x-auth-token'];
    router.push('/');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated,
        loading,
        login,
        register,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}; 