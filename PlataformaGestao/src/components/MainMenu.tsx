import React from 'react';
import { Building2 } from 'lucide-react';

import { useAuth } from '../context/AuthContext';
import { Truck, Users, Bike, Contact, Map } from 'lucide-react';

interface MainMenuProps {
  onMenuClick: (page: 'main' | 'tasks' | 'motorcycles' | 'drivers' | 'clients'| 'companies' | 'routes') => void;
}

const MainMenu: React.FC<MainMenuProps> = ({ onMenuClick }) => {
  const { role } = useAuth();
  const isManager = role === 'manager';

  const menuItems = [
    { 
      id: 1, 
      label: 'Tarefas', 
      page: 'tasks' as const,
      description: 'Gerir tarefas',
      icon: <Truck className="w-6 h-6 text-blue-600" />
    },
    { 
      id: 2, 
      label: 'Condutores', 
      page: 'drivers' as const,
      description: 'Gestão de condutores',
      icon: <Users className="w-6 h-6 text-green-600" />
    },
    { 
      id: 3, 
      label: 'Motas', 
      page: 'motorcycles' as const,
      description: 'Gestão de Motas',
      icon: <Bike className="w-6 h-6 text-purple-600" />
    },


    { 
      id: 4, 
      label: 'Clientes', 
      page: 'clients' as const,
      description: 'Gestão de clientes',
      icon: <Contact className="w-6 h-6 text-pink-600" />  // (ou outro ícone que prefiras!)
    },

    { 
  id: 5, 
  label: 'Empresas & Serviços', 
  page: 'companies' as const,
  description: 'Gestão de empresas e serviços',
  icon: <Building2 className="w-6 h-6 text-orange-600" />
},


{ 
  id: 6, 
  label: 'Rotas', 
  page: 'routes' as const,
  description: 'Planeamento de rotas',
  icon: <Map className="w-6 h-6 text-blue-500" />
},

  ].filter(item => !isManager || item.page !== 'companies');

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {menuItems.map((item) => (
        <button
          key={item.id}
          onClick={() => onMenuClick(item.page)}
          className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow border border-gray-200 dark:border-gray-700 text-left"
        >
          <div className="flex items-start gap-4">
            <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
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
  );
};

export default MainMenu;
