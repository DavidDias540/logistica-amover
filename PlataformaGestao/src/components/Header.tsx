import React, { useState, useEffect } from 'react';
import UserProfile from './UserProfile';
import { apiClient } from '../api/client';
import { User } from '../types/auth';

import { Moon, Sun } from 'lucide-react';

interface HeaderProps {
  time: string;
  title: string;
  user: User | null;
  onProfileClick: () => void;
  isDarkMode: boolean;
  toggleTheme: () => void;
}

const Header: React.FC<HeaderProps> = ({ time, title, user, onProfileClick, isDarkMode, toggleTheme }) => {
  const [photo, setPhoto] = useState<string>('');

  const fetchPhoto = () => {
    if (user?.email) {
      apiClient.get(`/api/User/byEmail/${user.email}`)
        .then(res => {
          if (res.data?.photoUrl) {
            setPhoto(res.data.photoUrl);
          }
        })
        .catch(() => {});
    }
  };

  useEffect(() => {
    fetchPhoto();
    
    const handleProfileUpdate = () => {
      fetchPhoto();
    };
    window.addEventListener('profileUpdated', handleProfileUpdate);
    return () => window.removeEventListener('profileUpdated', handleProfileUpdate);
  }, [user?.email]);

  return (
    <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 transition-colors">
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">{title}</h1>
        </div>
        <div className="flex items-center gap-6">
          <button 
            onClick={toggleTheme} 
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 transition-colors"
            title="Alternar Tema"
          >
            {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          
          <UserProfile name={user?.name ?? ""} photo={photo} onClick={onProfileClick} />

          <div className="text-gray-600 dark:text-gray-300 font-medium">{time}</div>
        </div>
      </div>
    </div>
  );
};

export default Header;