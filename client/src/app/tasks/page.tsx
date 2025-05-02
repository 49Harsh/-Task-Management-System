'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../hooks/useAuth';
import axios from 'axios';
import { toast } from 'react-toastify';
import Link from 'next/link';
import { format } from 'date-fns';
import { FiFilter, FiPlus, FiSearch } from 'react-icons/fi';

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
};

export default function Tasks() {
  const { isAuthenticated, user, loading, token } = useAuth();
  const router = useRouter();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, loading, router]);

  useEffect(() => {
    const fetchTasks = async () => {
      if (!token) return;

      try {
        const config = {
          headers: {
            'x-auth-token': token
          }
        };

        const res = await axios.get('http://localhost:5000/api/tasks', config);
        setTasks(res.data);
      } catch (error) {
        console.error('Error fetching tasks:', error);
        toast.error('Failed to fetch tasks');
      } finally {
        setIsLoading(false);
      }
    };

    if (isAuthenticated && user) {
      fetchTasks();
    }
  }, [isAuthenticated, token, user]);

  // Filter tasks based on search term and filters
  const filteredTasks = tasks.filter(task => {
    // Search term filter
    const matchesSearch = searchTerm === '' || 
      task.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
      (task.description && task.description.toLowerCase().includes(searchTerm.toLowerCase()));
    
    // Status filter
    const matchesStatus = statusFilter === '' || task.status === statusFilter;
    
    // Priority filter
    const matchesPriority = priorityFilter === '' || task.priority === priorityFilter;
    
    return matchesSearch && matchesStatus && matchesPriority;
  });

  if (loading || !isAuthenticated) {
    return <div className="text-center p-8">Loading...</div>;
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-gray-800">All Tasks</h1>
        <Link 
          href="/tasks/new" 
          className="flex items-center bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
        >
          <FiPlus className="mr-2" /> New Task
        </Link>
      </div>

      {/* Search and filter */}
      <div className="bg-white p-4 rounded-lg shadow-md mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <FiSearch className="absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                placeholder="Search tasks..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <div className="flex gap-4">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="in progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="archived">Archived</option>
            </select>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Priorities</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="text-center p-8">Loading tasks...</div>
      ) : (
        <>
          <div className="mb-4">
            <p className="text-gray-500">
              Showing {filteredTasks.length} of {tasks.length} tasks
            </p>
          </div>

          {filteredTasks.length === 0 ? (
            <div className="bg-white p-8 rounded-lg shadow-md text-center">
              <p className="text-gray-500">No tasks found. Try a different search or filter.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredTasks.map(task => (
                <Link key={task._id} href={`/tasks/${task._id}`}>
                  <div className="bg-white p-4 rounded-md shadow-sm hover:shadow-md transition-shadow border-l-4 border-blue-500">
                    <h3 className="font-semibold text-lg text-gray-800 mb-1">{task.title}</h3>
                    <p className="text-gray-600 text-sm mb-2 line-clamp-2">{task.description}</p>
                    <div className="flex flex-wrap justify-between items-center text-xs text-gray-500">
                      <div className="flex gap-2 mb-2 md:mb-0">
                        <span className={`px-2 py-1 rounded-full ${
                          task.priority === 'high' ? 'bg-red-100 text-red-800' :
                          task.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {task.priority}
                        </span>
                        <span className={`px-2 py-1 rounded-full ${
                          task.status === 'pending' ? 'bg-gray-100 text-gray-800' :
                          task.status === 'in progress' ? 'bg-blue-100 text-blue-800' :
                          task.status === 'completed' ? 'bg-green-100 text-green-800' :
                          'bg-purple-100 text-purple-800'
                        }`}>
                          {task.status}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {task.dueDate && (
                          <div>Due: {format(new Date(task.dueDate), 'MMM dd, yyyy')}</div>
                        )}
                        <div>
                          Assigned: {task.assignedTo ? task.assignedTo.name : 'Unassigned'}
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
} 