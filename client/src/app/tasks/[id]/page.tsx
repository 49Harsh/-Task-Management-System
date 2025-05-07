'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useAuth } from '../../hooks/useAuth';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import api from '../../utils/api';
import { toast } from 'react-toastify';
import Link from 'next/link';
import { format } from 'date-fns';
import { FiEdit, FiTrash2, FiX, FiCheck } from 'react-icons/fi';

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

type Task = {
  _id: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  dueDate: string;
  createdBy: {
    _id: string;
    name: string;
  };
  assignedTo: {
    _id: string;
    name: string;
  } | null;
  createdAt: string;
  updatedAt: string;
};

export default function TaskDetail({ params }: { params: { id: string } }) {
  const { isAuthenticated, user, loading, token } = useAuth();
  const router = useRouter();
  const [task, setTask] = useState<Task | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  
  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, loading, router]);

  useEffect(() => {
    const fetchTask = async () => {
      if (!token) return;
      
      try {
        const res = await api.get(`/tasks/${params.id}`);
        setTask(res.data);
        
        // Set form default values
        reset({
          title: res.data.title,
          description: res.data.description,
          dueDate: res.data.dueDate ? new Date(res.data.dueDate).toISOString().split('T')[0] : '',
          priority: res.data.priority,
          status: res.data.status,
          assignedTo: res.data.assignedTo?._id || ''
        });
      } catch (error) {
        console.error('Error fetching task:', error);
        toast.error('Failed to fetch task details');
        router.push('/dashboard');
      } finally {
        setIsLoading(false);
      }
    };
    
    const fetchUsers = async () => {
      if (!token) return;
      
      try {
        const res = await api.get('/users');
        setUsers(res.data);
      } catch (error) {
        console.error('Error fetching users:', error);
        toast.error('Failed to fetch users');
      }
    };
    
    if (isAuthenticated && params.id) {
      fetchTask();
      fetchUsers();
    }
  }, [isAuthenticated, params.id, reset, token, router]);

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    
    try {
      const res = await api.put(`/tasks/${params.id}`, data);
      setTask(res.data);
      setIsEditing(false);
      toast.success('Task updated successfully!');
    } catch (error: any) {
      console.error('Error updating task:', error);
      toast.error(error.response?.data?.message || 'Failed to update task');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this task? This action cannot be undone.')) {
      return;
    }
    
    setIsDeleting(true);
    
    try {
      await api.delete(`/tasks/${params.id}`);
      toast.success('Task deleted successfully!');
      router.push('/dashboard');
    } catch (error: any) {
      console.error('Error deleting task:', error);
      toast.error(error.response?.data?.message || 'Failed to delete task');
      setIsDeleting(false);
    }
  };

  if (loading || !isAuthenticated) {
    return <div className="text-center p-8">Loading...</div>;
  }

  if (isLoading) {
    return <div className="text-center p-8">Loading task details...</div>;
  }

  if (!task) {
    return <div className="text-center p-8">Task not found</div>;
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-gray-800">
          {isEditing ? 'Edit Task' : 'Task Details'}
        </h1>
        <Link 
          href="/dashboard" 
          className="text-blue-600 hover:underline"
        >
          Back to Dashboard
        </Link>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow-md">
        {isEditing ? (
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="mb-4">
              <label htmlFor="title" className="block text-gray-700 font-medium mb-2">
                Title *
              </label>
              <input
                id="title"
                type="text"
                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                  className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  {...register('dueDate')}
                />
              </div>
              
              <div>
                <label htmlFor="assignedTo" className="block text-gray-700 font-medium mb-2">
                  Assign To
                </label>
                <select
                  id="assignedTo"
                  className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                  className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                  className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  {...register('status')}
                >
                  <option value="pending">Pending</option>
                  <option value="in progress">In Progress</option>
                  <option value="completed">Completed</option>
                  <option value="archived">Archived</option>
                </select>
              </div>
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="flex items-center px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                <FiX className="mr-2" /> Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex items-center bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
              >
                <FiCheck className="mr-2" /> {isSubmitting ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        ) : (
          <>
            <div className="mb-4 flex justify-between items-start">
              <div>
                <h2 className="text-2xl font-semibold text-gray-800 mb-2">{task.title}</h2>
                <div className="flex items-center mb-4">
                  <span className={`px-2 py-1 rounded-full text-sm ${
                    task.priority === 'high' ? 'bg-red-100 text-red-800' :
                    task.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-green-100 text-green-800'
                  } mr-2`}>
                    {task.priority}
                  </span>
                  <span className={`px-2 py-1 rounded-full text-sm ${
                    task.status === 'pending' ? 'bg-gray-100 text-gray-800' :
                    task.status === 'in progress' ? 'bg-blue-100 text-blue-800' :
                    task.status === 'completed' ? 'bg-green-100 text-green-800' :
                    'bg-purple-100 text-purple-800'
                  }`}>
                    {task.status}
                  </span>
                </div>
              </div>
              
              <div className="flex space-x-2">
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center px-3 py-2 border border-gray-300 rounded-md text-blue-600 hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  <FiEdit className="mr-1" /> Edit
                </button>
                <button
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="flex items-center px-3 py-2 border border-gray-300 rounded-md text-red-600 hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50"
                >
                  <FiTrash2 className="mr-1" /> {isDeleting ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-md mb-4">
              <p className="text-gray-700 whitespace-pre-line">{task.description || 'No description provided.'}</p>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-gray-50 p-3 rounded-md">
                <p className="text-sm text-gray-500 mb-1">Created By</p>
                <p className="font-medium text-gray-800">{task.createdBy.name}</p>
              </div>
              
              <div className="bg-gray-50 p-3 rounded-md">
                <p className="text-sm text-gray-500 mb-1">Assigned To</p>
                <p className="font-medium text-gray-800">{task.assignedTo?.name || 'Unassigned'}</p>
              </div>
              
              <div className="bg-gray-50 p-3 rounded-md">
                <p className="text-sm text-gray-500 mb-1">Due Date</p>
                <p className="font-medium text-gray-800">
                  {task.dueDate ? format(new Date(task.dueDate), 'MMMM d, yyyy') : 'No due date'}
                </p>
              </div>
              
              <div className="bg-gray-50 p-3 rounded-md">
                <p className="text-sm text-gray-500 mb-1">Created On</p>
                <p className="font-medium text-gray-800">
                  {format(new Date(task.createdAt), 'MMMM d, yyyy')}
                </p>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
} 