import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface DriverSchedule {
  id: number;
  date: string;
  startTime: string;
  endTime: string;
  status: 'active' | 'completed' | 'cancelled';
}

export interface Driver {
  id: number;
  name: string;
  photo?: string;
  status: 'active' | 'inactive';
  license: string;
  phone: string;
  email: string;
  address: string;
  citizenId: string;
  schedules: DriverSchedule[];
  assignedMotorcycleId?: string;
}

interface DriverStore {
  drivers: Driver[];
  addDriver: (driver: Omit<Driver, 'id' | 'schedules'>) => void;
  updateDriver: (id: number, updates: Partial<Driver>) => void;
  addSchedule: (driverId: number, schedule: Omit<DriverSchedule, 'id'>) => void;
  assignMotorcycle: (driverId: number, motorcycleId: string) => void;
  unassignMotorcycle: (driverId: number) => void;
}

export const useDriverStore = create<DriverStore>()(
  persist(
    (set, get) => ({
      drivers: [
        {
          id: 1,
          name: 'João Silva',
          status: 'active',
          license: 'A12345',
          phone: '912345678',
          email: 'joao.silva@email.com',
          address: 'Rua Principal, 123, Vila Real',
          citizenId: '12345678',
          schedules: [
            {
              id: 1,
              date: '2025-03-15',
              startTime: '09:00',
              endTime: '17:00',
              status: 'active'
            }
          ]
        },
        {
          id: 2,
          name: 'Maria Santos',
          status: 'active',
          license: 'B67890',
          phone: '923456789',
          email: 'maria.santos@email.com',
          address: 'Avenida Central, 456, Vila Real',
          citizenId: '87654321',
          schedules: [
            {
              id: 1,
              date: '2025-03-15',
              startTime: '08:00',
              endTime: '16:00',
              status: 'active'
            }
          ]
        }
      ],
      addDriver: (driver) =>
        set((state) => {
          const newId = Math.max(...state.drivers.map(d => d.id), 0) + 1;
          const newDriver = {
            ...driver,
            id: newId,
            schedules: []
          };
          return {
            drivers: [...state.drivers, newDriver]
          };
        }),
      updateDriver: (id, updates) =>
        set((state) => ({
          drivers: state.drivers.map((d) =>
            d.id === id ? { ...d, ...updates } : d
          )
        })),
      addSchedule: (driverId, schedule) =>
        set((state) => ({
          drivers: state.drivers.map((d) =>
            d.id === driverId
              ? {
                  ...d,
                  schedules: [
                    ...d.schedules,
                    { ...schedule, id: d.schedules.length + 1 }
                  ]
                }
              : d
          )
        })),
      assignMotorcycle: (driverId, motorcycleId) =>
        set((state) => ({
          drivers: state.drivers.map((d) =>
            d.id === driverId
              ? { ...d, assignedMotorcycleId: motorcycleId }
              : d
          )
        })),
      unassignMotorcycle: (driverId) =>
        set((state) => ({
          drivers: state.drivers.map((d) =>
            d.id === driverId
              ? { ...d, assignedMotorcycleId: undefined }
              : d
          )
        }))
    }),
    {
      name: 'driver-storage',
    }
  )
);