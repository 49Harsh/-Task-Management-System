'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import api from '../utils/api';
import { toast } from 'react-toastify';
import Link from 'next/link';
import { format } from 'date-fns';
import { FiCheckCircle, FiTrash2, FiMail } from 'react-icons/fi';

type Notification = {
  _id: string;
  message: string;
  type: string;
  read: boolean;
  sender?: {
    _id: string;
    name: string;
  };
  task?: {
    _id: string;
    title: string;
  };
  createdAt: string;
};

export default function Notifications() {
  const { isAuthenticated, user, loading, token } = useAuth();
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, loading, router]);

  useEffect(() => {
    const fetchNotifications = async () => {
      if (!token) return;
      
      try {
        const res = await api.get('/notifications');
        setNotifications(res.data);
      } catch (error) {
        console.error('Error fetching notifications:', error);
        toast.error('Failed to fetch notifications');
      } finally {
        setIsLoading(false);
      }
    };
    
    if (isAuthenticated) {
      fetchNotifications();
    }
  }, [isAuthenticated, token]);

  const markAsRead = async (id: string) => {
    try {
      await api.put(`/notifications/${id}`, {});
      
      // Update local state
      setNotifications(notifications.map(notification => 
        notification._id === id ? { ...notification, read: true } : notification
      ));
      
      toast.success('Notification marked as read');
    } catch (error) {
      console.error('Error marking notification as read:', error);
      toast.error('Failed to update notification');
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.put('/notifications/read/all', {});
      
      // Update local state
      setNotifications(notifications.map(notification => ({ ...notification, read: true })));
      
      toast.success('All notifications marked as read');
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      toast.error('Failed to update notifications');
    }
  };

  const deleteNotification = async (id: string) => {
    try {
      await api.delete(`/notifications/${id}`);
      
      // Update local state
      setNotifications(notifications.filter(notification => notification._id !== id));
      
      toast.success('Notification deleted');
    } catch (error) {
      console.error('Error deleting notification:', error);
      toast.error('Failed to delete notification');
    }
  };

  const clearAllRead = async () => {
    try {
      await api.delete('/notifications');
      
      // Update local state
      setNotifications(notifications.filter(notification => !notification.read));
      
      toast.success('All read notifications cleared');
    } catch (error) {
      console.error('Error clearing read notifications:', error);
      toast.error('Failed to clear notifications');
    }
  };

  const NotificationItem = ({ notification }: { notification: Notification }) => (
    <div className={`bg-white p-4 rounded-lg shadow-sm border-l-4 ${
      notification.read ? 'border-gray-300' : 'border-blue-500'
    } mb-4 flex justify-between items-start`}>
      <div className="flex-1">
        <div className="flex items-center mb-2">
          <FiMail className={notification.read ? "text-gray-400 mr-2" : "text-blue-500 mr-2"} />
          <p className="text-gray-800 font-medium">{notification.message}</p>
        </div>
        
        {notification.task && (
          <Link 
            href={`/tasks/${notification.task._id}`}
            className="text-sm text-blue-600 hover:underline block mb-2"
          >
            View task: {notification.task.title}
          </Link>
        )}
        
        <div className="text-xs text-gray-500">
          {notification.sender && <span className="mr-3">From: {notification.sender.name}</span>}
          <span>{format(new Date(notification.createdAt), 'MMM d, yyyy h:mm a')}</span>
        </div>
      </div>
      
      <div className="flex space-x-2">
        {!notification.read && (
          <button
            onClick={() => markAsRead(notification._id)}
            className="text-green-600 hover:text-green-800"
            title="Mark as read"
          >
            <FiCheckCircle />
          </button>
        )}
        
        <button
          onClick={() => deleteNotification(notification._id)}
          className="text-red-600 hover:text-red-800"
          title="Delete notification"
        >
          <FiTrash2 />
        </button>
      </div>
    </div>
  );

  if (loading || !isAuthenticated) {
    return <div className="text-center p-8">Loading...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-gray-800">Notifications</h1>
        
        <div className="flex space-x-3">
          <button
            onClick={markAllAsRead}
            className="px-4 py-2 text-blue-600 border border-blue-600 rounded hover:bg-blue-50"
            disabled={notifications.every(n => n.read)}
          >
            Mark All as Read
          </button>
          <button
            onClick={clearAllRead}
            className="px-4 py-2 text-red-600 border border-red-600 rounded hover:bg-red-50"
            disabled={!notifications.some(n => n.read)}
          >
            Clear Read Notifications
          </button>
        </div>
      </div>
      
      {isLoading ? (
        <div className="text-center p-8">Loading notifications...</div>
      ) : notifications.length === 0 ? (
        <div className="bg-white p-8 rounded-lg shadow-md text-center">
          <p className="text-gray-500">You don&apos;t have any notifications.</p>
        </div>
      ) : (
        <div>
          <div className="mb-4">
            <p className="text-gray-500">
              Showing {notifications.length} notification{notifications.length !== 1 ? 's' : ''}
              {' '}({notifications.filter(n => !n.read).length} unread)
            </p>
          </div>
          
          {notifications.map(notification => (
            <NotificationItem key={notification._id} notification={notification} />
          ))}
        </div>
      )}
    </div>
  );
} 