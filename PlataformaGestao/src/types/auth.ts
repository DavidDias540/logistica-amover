export type UserRole = 'admin' | 'manager' | 'motorista' | 'user';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}


