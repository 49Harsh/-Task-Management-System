'use client';

import Link from 'next/link';
import { useAuth } from '../hooks/useAuth';
import { FiHome, FiUser, FiLogOut, FiList, FiBell } from 'react-icons/fi';

const Navbar = () => {
  const { isAuthenticated, user, logout } = useAuth();

  return (
    <nav className="bg-white shadow-md py-3 px-4 mb-8">
      <div className="container mx-auto flex justify-between items-center">
        <Link href="/" className="text-xl font-bold text-blue-600">
          Task Management
        </Link>

        {isAuthenticated ? (
          <div className="flex items-center space-x-6">
            <Link href="/dashboard" className="flex items-center text-gray-600 hover:text-blue-600">
              <FiHome className="mr-1" /> Dashboard
            </Link>
            <Link href="/tasks" className="flex items-center text-gray-600 hover:text-blue-600">
              <FiList className="mr-1" /> Tasks
            </Link>
            <Link href="/notifications" className="flex items-center text-gray-600 hover:text-blue-600">
              <FiBell className="mr-1" /> Notifications
            </Link>
            <Link href="/profile" className="flex items-center text-gray-600 hover:text-blue-600">
              <FiUser className="mr-1" /> {user?.name || 'Profile'}
            </Link>
            <button 
              onClick={logout}
              className="flex items-center text-gray-600 hover:text-red-600"
            >
              <FiLogOut className="mr-1" /> Logout
            </button>
          </div>
        ) : (
          <div className="flex items-center space-x-4">
            <Link 
              href="/login" 
              className="px-4 py-2 text-blue-600 border border-blue-600 rounded hover:bg-blue-50"
            >
              Login
            </Link>
            <Link 
              href="/register" 
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Register
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar; 