export interface Task {
  id: number;
  title: string;
  location: string;
  address: string;
  date: string;
  priority: 'ALTA' | 'MÉDIA' | 'BAIXA';
  type: 'Entrega' | 'Recolha';
  time: string;
  availableTime: string;
  status: 'POR CONCLUIR' | 'CONCLUÍDO';
}

// Shared tasks data
export const initialTasks: Task[] = [
  {
    id: 1,
    title: 'UTAD - ECT - Polo I',
    location: 'UTAD - ECT - Polo I',
    address: 'Quinta dos Prados, 5100-801, Vila Real',
    date: '2025-06-16',
    priority: 'ALTA',
    type: 'Entrega',
    time: '12:00',
    availableTime: '9:00 às 12:00',
    status: 'POR CONCLUIR'
  },
  {
    id: 2,
    title: 'Entrega no ZOO',
    location: 'Entrega no ZOO',
    address: 'Quinta do ZOO, 5234-122, Vila Real',
    date: '2025-06-16',
    priority: 'MÉDIA',
    type: 'Entrega',
    time: '14:30',
    availableTime: '14:00 às 15:00',
    status: 'POR CONCLUIR'
  },
  {
    id: 3,
    title: 'Lidl',
    location: 'Lidl',
    address: 'Avenida 1º Maio, 5521-332, Vila Real',
    date: '2025-06-16',
    priority: 'BAIXA',
    type: 'Recolha',
    time: '16:00',
    availableTime: '15:00 às 17:00',
    status: 'POR CONCLUIR'
  },
  {
    id: 4,
    title: 'Hospital',
    location: 'Centro Hospitalar de Trás-os-Montes e Alto Douro',
    address: 'Av. da Noruega, 5000-508 Vila Real',
    date: '2025-06-17',
    priority: 'ALTA',
    type: 'Entrega',
    time: '09:00',
    availableTime: '8:00 às 10:00',
    status: 'POR CONCLUIR'
  },
  {
    id: 5,
    title: 'Farmácia',
    location: 'Farmácia Central',
    address: 'R. Direita 123, Vila Real',
    date: '2025-06-17',
    priority: 'MÉDIA',
    type: 'Recolha',
    time: '11:30',
    availableTime: '11:00 às 12:00',
    status: 'POR CONCLUIR'
  },
  {
    id: 6,
    title: 'Mercado Municipal',
    location: 'Mercado Municipal de Vila Real',
    address: 'R. do Mercado 45, Vila Real',
    date: '2025-06-18',
    priority: 'BAIXA',
    type: 'Entrega',
    time: '08:00',
    availableTime: '7:00 às 9:00',
    status: 'POR CONCLUIR'
  },
  {
    id: 7,
    title: 'Escola Secundária',
    location: 'Escola Secundária São Pedro',
    address: 'R. Morgado Mateus, Vila Real',
    date: '2025-06-18',
    priority: 'MÉDIA',
    type: 'Entrega',
    time: '13:00',
    availableTime: '12:00 às 14:00',
    status: 'POR CONCLUIR'
  },
  {
    id: 8,
    title: 'Centro Comercial',
    location: 'Nosso Shopping',
    address: 'Av. Aureliano Barrigas, Vila Real',
    date: '2025-06-19',
    priority: 'ALTA',
    type: 'Recolha',
    time: '10:00',
    availableTime: '9:00 às 11:00',
    status: 'POR CONCLUIR'
  }
];