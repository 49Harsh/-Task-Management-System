'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useAuth } from '../../hooks/useAuth';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { toast } from 'react-toastify';
import Link from 'next/link';

type FormData = {
  title: string;
  description: string;
  dueDate: string;
  priority: 'low' | 'medium' | 'high';
  status: 'pending' | 'in progress' | 'completed' | 'archived';
  assignedTo: string;
};

type User = {
  _id: string;
  name: string;
};

export default function NewTask() {
  const { isAuthenticated, user, loading, token } = useAuth();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    defaultValues: {
      status: 'pending',
      priority: 'medium'
    }
  });

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, loading, router]);

  useEffect(() => {
    const fetchUsers = async () => {
      if (!token) return;
      
      try {
        const config = {
          headers: {
            'x-auth-token': token
          }
        };
        
        const res = await axios.get('http://localhost:5000/api/users', config);
        console.log("Available users:", res.data);
        setUsers(res.data);
      } catch (error) {
        console.error('Error fetching users:', error);
        toast.error('Failed to fetch users');
      }
    };
    
    if (isAuthenticated) {
      fetchUsers();
    }
  }, [isAuthenticated, token]);

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    
    try {
      if (!user?.id) {
        throw new Error('User is not authenticated');
      }

      // Format date properly for MongoDB/ISO standard
      let formattedData = { ...data };
      if (formattedData.dueDate) {
        // Make sure we have a valid date string in ISO format
        const dateObj = new Date(formattedData.dueDate);
        formattedData.dueDate = dateObj.toISOString();
      }
      
      const config = {
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token
        }
      };

      console.log("Submitting task:", formattedData);
      
      const res = await axios.post('http://localhost:5000/api/tasks', formattedData, config);
      toast.success('Task created successfully!');
      router.push('/dashboard');
    } catch (error: any) {
      console.error('Error creating task:', error);
      toast.error(error.response?.data?.message || 'Failed to create task');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading || !isAuthenticated) {
    return <div className="text-center p-8">Loading...</div>;
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-gray-800">Create New Task</h1>
        <Link 
          href="/dashboard" 
          className="text-blue-600 hover:underline"
        >
          Back to Dashboard
        </Link>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow-md">
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="mb-4">
            <label htmlFor="title" className="block text-gray-700 font-medium mb-2">
              Title *
            </label>
            <input
              id="title"
              type="text"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Task title"
              {...register('title', { required: 'Title is required' })}
            />
            {errors.title && (
              <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>
            )}
          </div>
          
          <div className="mb-4">
            <label htmlFor="description" className="block text-gray-700 font-medium mb-2">
              Description
            </label>
            <textarea
              id="description"
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Task description"
              {...register('description')}
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label htmlFor="dueDate" className="block text-gray-700 font-medium mb-2">
                Due Date
              </label>
              <input
                id="dueDate"
                type="date"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                {...register('dueDate')}
              />
            </div>
            
            <div>
              <label htmlFor="assignedTo" className="block text-gray-700 font-medium mb-2">
                Assign To
              </label>
              <select
                id="assignedTo"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                {...register('assignedTo')}
              >
                <option value="">Select a user</option>
                {users.map(user => (
                  <option key={user._id} value={user._id}>
                    {user.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label htmlFor="priority" className="block text-gray-700 font-medium mb-2">
                Priority
              </label>
              <select
                id="priority"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                {...register('priority')}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
            
            <div>
              <label htmlFor="status" className="block text-gray-700 font-medium mb-2">
                Status
              </label>
              <select
                id="status"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                {...register('status')}
              >
                <option value="pending">Pending</option>
                <option value="in progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="archived">Archived</option>
              </select>
            </div>
          </div>
          
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
            >
              {isSubmitting ? 'Creating...' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 