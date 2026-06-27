import React from 'react';
import { Home, ClipboardCheck, Map, Calendar, Settings } from 'lucide-react';

interface BottomNavigationProps {
  currentPage: 'main' | 'routes' | 'settings' | 'assistance' | 'calendar' | 'tasks';
  onPageChange: (page: 'main' | 'routes' | 'settings' | 'assistance' | 'calendar' | 'tasks') => void;
}

const BottomNavigation: React.FC<BottomNavigationProps> = ({ currentPage, onPageChange }) => {
  const navItems = [
    { id: 1, icon: <Home size={28} />, page: 'main' as const },
    { id: 2, icon: <ClipboardCheck size={28} />, page: 'tasks' as const },
    { id: 3, icon: <Map size={28} />, page: 'routes' as const },
    { id: 4, icon: <Calendar size={28} />, page: 'calendar' as const },
    { id: 5, icon: <Settings size={28} />, page: 'settings' as const },
  ];

  return (
    <div className="bg-[#333333] text-white py-3 px-4 flex justify-between items-center rounded-t-md">
      {navItems.map((item) => (
        <button
          key={item.id}
          className={`p-2 transition-opacity ${currentPage === item.page ? 'opacity-100' : 'opacity-50'}`}
          onClick={() => onPageChange(item.page)}
        >
          {item.icon}
        </button>
      ))}
    </div>
  );
};

export default BottomNavigation