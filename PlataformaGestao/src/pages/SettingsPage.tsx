import React from 'react';
import { User, HelpCircle, PenTool as Tool } from 'lucide-react';

interface SettingsPageProps {
  onMenuClick: (page: 'main' | 'drivers' | 'settings' | 'assistance' | 'profile' | 'maintenance') => void;
}

const SettingsPage: React.FC<SettingsPageProps> = ({ onMenuClick }) => {
  const menuItems = [
    
    { 
      id: 1, 
      label: 'Assistência', 
      page: 'assistance' as const,
      description: 'Suporte e ajuda',
      icon: <HelpCircle className="w-6 h-6 text-green-600" />
    },
    { 
      id: 2, 
      label: 'Manutenções', 
      page: 'maintenance' as const,
      description: 'Manutenção de motas',
      icon: <Tool className="w-6 h-6 text-purple-600" />
    },
  ];

  return (
    <div className="flex flex-col h-full bg-background dark:bg-transparent p-6">
      <div className="max-w-3xl mx-auto w-full">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onMenuClick(item.page)}
              className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow border border-gray-200 dark:border-gray-700 text-left"
            >
              <div className="flex items-start gap-4">
                <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  {item.icon}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{item.label}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{item.description}</p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;