import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Motorcycle {
  id: string;
  matricula: string;
  name: string;
  status: 'Disponível' | 'Em Uso' | 'Manutenção';
  marca?: string;
  modelo?: string;
  maintenanceReason?: string;
  maintenanceDate?: string;
  assignedDriverId?: number;
  assignedTasks?: number[]; // Array of task IDs assigned to this motorcycle
}

interface MotorcycleStore {
  motorcycles: Motorcycle[];
  addMotorcycle: (motorcycle: Omit<Motorcycle, 'id'>) => void;
  updateMotorcycle: (id: string, updates: Partial<Motorcycle>) => void;
  setMaintenanceStatus: (id: string, reason: string) => void;
  assignMotorcycle: (motorcycleId: string, driverId: number) => void;
  unassignMotorcycle: (motorcycleId: string) => void;
  assignTaskToMotorcycle: (motorcycleId: string, taskId: number) => void;
  removeTaskFromMotorcycle: (motorcycleId: string, taskId: number) => void;
  clearAllTasks: (motorcycleId: string) => void;
}

export const useMotorcycleStore = create<MotorcycleStore>()(
  persist(
    (set, get) => ({
      motorcycles: [
        { 
          id: 'Mota-0001', 
          matricula: '45-RT-89', 
          name: 'Honda CB500X',
          status: 'Disponível',
          marca: 'Honda',
          modelo: 'CB500X',
          assignedTasks: []
        },
        { 
          id: 'Mota-0002', 
          matricula: '67-VB-23', 
          name: 'Yamaha MT-07',
          status: 'Disponível',
          marca: 'Yamaha',
          modelo: 'MT-07',
          assignedTasks: []
        },
        { 
          id: 'Mota-0003', 
          matricula: '12-ZX-45', 
          name: 'Kawasaki Z650',
          status: 'Disponível',
          marca: 'Kawasaki',
          modelo: 'Z650',
          assignedTasks: []
        }
      ],
      addMotorcycle: (motorcycle) => 
        set((state) => ({
          motorcycles: [...state.motorcycles, {
            ...motorcycle,
            id: `Mota-${String(state.motorcycles.length + 1).padStart(4, '0')}`,
            assignedTasks: []
          }]
        })),
      updateMotorcycle: (id, updates) =>
        set((state) => ({
          motorcycles: state.motorcycles.map((m) =>
            m.id === id ? { ...m, ...updates } : m
          )
        })),
      setMaintenanceStatus: (id, reason) =>
        set((state) => ({
          motorcycles: state.motorcycles.map((m) =>
            m.id === id
              ? {
                  ...m,
                  status: 'Manutenção',
                  maintenanceReason: reason,
                  maintenanceDate: new Date().toISOString().split('T')[0],
                  assignedTasks: []
                }
              : m
          )
        })),
      assignMotorcycle: (motorcycleId, driverId) =>
        set((state) => ({
          motorcycles: state.motorcycles.map((m) =>
            m.id === motorcycleId
              ? {
                  ...m,
                  assignedDriverId: driverId
                }
              : m
          )
        })),
      unassignMotorcycle: (motorcycleId) =>
        set((state) => ({
          motorcycles: state.motorcycles.map((m) =>
            m.id === motorcycleId
              ? {
                  ...m,
                  status: 'Disponível',
                  assignedDriverId: undefined,
                  assignedTasks: []
                }
              : m
          )
        })),
      assignTaskToMotorcycle: (motorcycleId, taskId) =>
        set((state) => ({
          motorcycles: state.motorcycles.map((m) =>
            m.id === motorcycleId
              ? {
                  ...m,
                  status: 'Em Uso',
                  assignedTasks: [...(m.assignedTasks || []), taskId]
                }
              : m
          )
        })),
      removeTaskFromMotorcycle: (motorcycleId, taskId) =>
        set((state) => ({
          motorcycles: state.motorcycles.map((m) => {
            if (m.id === motorcycleId) {
              const newTasks = (m.assignedTasks || []).filter(id => id !== taskId);
              return {
                ...m,
                assignedTasks: newTasks,
                status: newTasks.length > 0 ? 'Em Uso' : (m.assignedDriverId ? 'Disponível' : 'Disponível')
              };
            }
            return m;
          })
        })),
      clearAllTasks: (motorcycleId) =>
        set((state) => ({
          motorcycles: state.motorcycles.map((m) =>
            m.id === motorcycleId
              ? {
                  ...m,
                  assignedTasks: [],
                  status: m.assignedDriverId ? 'Disponível' : 'Disponível'
                }
              : m
          )
        }))
    }),
    {
      name: 'motorcycle-storage',
    }
  )
);