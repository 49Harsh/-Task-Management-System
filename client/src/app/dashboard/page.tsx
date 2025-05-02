'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../hooks/useAuth';
import axios from 'axios';
import { toast } from 'react-toastify';
import Link from 'next/link';
import { format } from 'date-fns';
import { FiPlus, FiClock, FiInbox, FiSend } from 'react-icons/fi';

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

export default function Dashboard() {
  const { isAuthenticated, user, loading, token } = useAuth();
  const router = useRouter();
  const [assignedTasks, setAssignedTasks] = useState<Task[]>([]);
  const [createdTasks, setCreatedTasks] = useState<Task[]>([]);
  const [overdueTasks, setOverdueTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [allTasks, setAllTasks] = useState<Task[]>([]);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, loading, router]);

  useEffect(() => {
    const fetchTasks = async () => {
      if (!token || !user?.id) return;

      try {
        const config = {
          headers: {
            'x-auth-token': token
          }
        };

        console.log("Current user ID:", user.id);
        const res = await axios.get('http://localhost:5000/api/tasks', config);
        const tasks = res.data;
        setAllTasks(tasks);

        // Log the first task data for debugging
        if (tasks.length > 0) {
          console.log("Sample task data:", {
            task: tasks[0],
            createdById: tasks[0].createdBy._id,
            assignedToId: tasks[0].assignedTo?._id
          });
        }
        
        // Filter tasks
        const currentDate = new Date();
        
        const assignedToMe = tasks.filter((task: Task) => 
          task.assignedTo && task.assignedTo._id === user.id
        );
        
        const createdByMe = tasks.filter((task: Task) => 
          task.createdBy._id === user.id
        );
        
        const overdue = tasks.filter((task: Task) => {
          if (!task.dueDate || task.status === 'completed') return false;
          const dueDate = new Date(task.dueDate);
          return dueDate < currentDate && task.status !== 'completed';
        });

        console.log("Filtered tasks:", {
          assignedToMe: assignedToMe.length,
          createdByMe: createdByMe.length,
          overdue: overdue.length
        });

        setAssignedTasks(assignedToMe);
        setCreatedTasks(createdByMe);
        setOverdueTasks(overdue);
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

  const TaskCard = ({ task }: { task: Task }) => (
    <Link href={`/tasks/${task._id}`}>
      <div className="bg-white p-4 rounded-md shadow-sm hover:shadow-md transition-shadow border-l-4 border-blue-500">
        <h3 className="font-semibold text-lg text-gray-800 mb-1">{task.title}</h3>
        <p className="text-gray-600 text-sm mb-2 line-clamp-2">{task.description}</p>
        <div className="flex justify-between items-center text-xs text-gray-500">
          <div>
            <span className={`px-2 py-1 rounded-full ${
              task.priority === 'high' ? 'bg-red-100 text-red-800' :
              task.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
              'bg-green-100 text-green-800'
            }`}>
              {task.priority}
            </span>
            <span className={`ml-2 px-2 py-1 rounded-full ${
              task.status === 'pending' ? 'bg-gray-100 text-gray-800' :
              task.status === 'in progress' ? 'bg-blue-100 text-blue-800' :
              task.status === 'completed' ? 'bg-green-100 text-green-800' :
              'bg-purple-100 text-purple-800'
            }`}>
              {task.status}
            </span>
          </div>
          {task.dueDate && <div>Due: {format(new Date(task.dueDate), 'MMM dd, yyyy')}</div>}
        </div>
      </div>
    </Link>
  );

  if (loading || !isAuthenticated) {
    return <div className="text-center p-8">Loading...</div>;
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
        <Link 
          href="/tasks/new" 
          className="flex items-center bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
        >
          <FiPlus className="mr-2" /> New Task
        </Link>
      </div>

      {isLoading ? (
        <div className="text-center p-8">Loading tasks...</div>
      ) : (
        <div className="grid md:grid-cols-3 gap-6">
          <div>
            <div className="flex items-center mb-4">
              <FiInbox className="text-blue-600 mr-2" />
              <h2 className="text-xl font-semibold text-gray-800">Assigned to Me ({assignedTasks.length})</h2>
            </div>
            <div className="space-y-4">
              {assignedTasks.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No tasks assigned to you</p>
              ) : (
                assignedTasks.map(task => <TaskCard key={task._id} task={task} />)
              )}
            </div>
          </div>

          <div>
            <div className="flex items-center mb-4">
              <FiSend className="text-blue-600 mr-2" />
              <h2 className="text-xl font-semibold text-gray-800">Created by Me ({createdTasks.length})</h2>
            </div>
            <div className="space-y-4">
              {createdTasks.length === 0 ? (
                <p className="text-gray-500 text-center py-4">You haven't created any tasks</p>
              ) : (
                createdTasks.map(task => <TaskCard key={task._id} task={task} />)
              )}
            </div>
          </div>

          <div>
            <div className="flex items-center mb-4">
              <FiClock className="text-red-600 mr-2" />
              <h2 className="text-xl font-semibold text-gray-800">Overdue Tasks ({overdueTasks.length})</h2>
            </div>
            <div className="space-y-4">
              {overdueTasks.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No overdue tasks</p>
              ) : (
                overdueTasks.map(task => <TaskCard key={task._id} task={task} />)
              )}
            </div>
          </div>
        </div>
      )}

      {!isLoading && allTasks.length === 0 && (
        <div className="bg-white p-8 rounded-lg shadow-md text-center mt-8">
          <p className="text-gray-700 mb-4">You don't have any tasks yet.</p>
          <Link 
            href="/tasks/new" 
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Create Your First Task
          </Link>
        </div>
      )}
    </div>
  );
} 