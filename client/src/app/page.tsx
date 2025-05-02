'use client';

import Link from 'next/link';
import { useAuth } from './hooks/useAuth';
import { FiCheckCircle, FiUsers, FiClock, FiSearch } from 'react-icons/fi';

export default function Home() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-3">
            Streamline Your Team&apos;s Workflow
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            A simple, effective task management system designed for small teams to collaborate efficiently.
          </p>
          
          {!isAuthenticated && (
            <div className="mt-8 flex justify-center gap-4">
              <Link
                href="/register"
                className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Get Started
              </Link>
              <Link
                href="/login"
                className="px-6 py-3 border border-blue-600 text-blue-600 rounded-md hover:bg-blue-50 transition-colors"
              >
                Login
              </Link>
            </div>
          )}
          
          {isAuthenticated && (
            <div className="mt-8">
              <Link
                href="/dashboard"
                className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Go to Dashboard
              </Link>
            </div>
          )}
        </div>
        
        <div className="grid md:grid-cols-2 gap-8 my-16">
          <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
            <div className="text-blue-600 mb-4">
              <FiCheckCircle size={32} />
            </div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">
              Task Management
            </h2>
            <p className="text-gray-600">
              Create, assign, update, and track tasks with ease. Set priorities, due dates,
              and statuses to keep everyone on the same page.
            </p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
            <div className="text-blue-600 mb-4">
              <FiUsers size={32} />
            </div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">
              Team Collaboration
            </h2>
            <p className="text-gray-600">
              Assign tasks to team members and receive notifications when tasks are assigned
              to you, ensuring smooth collaboration among the team.
            </p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
            <div className="text-blue-600 mb-4">
              <FiClock size={32} />
            </div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">
              Dashboard Overview
            </h2>
            <p className="text-gray-600">
              Get a clear overview of all your tasks, including those assigned to you, 
              tasks you created, and overdue tasks requiring immediate attention.
            </p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
            <div className="text-blue-600 mb-4">
              <FiSearch size={32} />
            </div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">
              Search and Filter
            </h2>
            <p className="text-gray-600">
              Quickly find the tasks you need with powerful search and filtering options.
              Filter by status, priority, due date, and more.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
