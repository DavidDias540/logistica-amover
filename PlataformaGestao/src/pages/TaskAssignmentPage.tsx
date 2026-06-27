import {
  MapPin, ChevronLeft, ChevronRight,
  X, Trash2, ChevronDown, ChevronUp
} from "lucide-react";
import { apiClient } from "../api/client";
import React, { useEffect, useState, useMemo } from "react";
import CustomDialog from "../components/CustomDialog";
import ConfirmationDialog from "../components/ConfirmationDialog";


interface Task {
  id: number;
  title: string;
  date: string;
  priority: string;
  time: string;
  serviceid: number | null;
  motorcycleid: number | null;
  clientid: number | null;
  notes?: string | null;
  instructions?: string | null;

  street?: string | null;
  door_number?: string | null;
  floor?: string | null;
  postal_code?: string | null;
  city?: string | null;
}


interface Vehicle {
  id: number;
  name: string;
  status: string;
  ownerID: number | null;
  owner?: {
    id: number;
    status: string;
    company_id: number;
    company: {
      id: number;
      name: string;
      services: {
        id: number;
      }[];
    };
  } | null;
  driver?: {
    id: number;
    status: string;
    company_id: number;
    company: {
      id: number;
      name: string;
      services: {
        id: number;
      }[];
    };
  } | null;
}


interface Driver {
  id: number;
  name: string;
}


interface Props {
  onOpenRoute?: (vehicleId: number, date: Date) => void;
}



const TaskAssignmentPage: React.FC<Props> = () => {

  const [selectedDate, setSelectedDate] = useState(new Date());
  const [tasks, setTasks] = useState<Task[]>([]);
  const [motorcycles, setMotorcycles] = useState<Vehicle[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [selectedTasks, setSelectedTasks] = useState<Task[]>([]);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [expandedMotos, setExpandedMotos] = useState<Record<number, boolean>>({});
  const [isUnassignedOpen, setIsUnassignedOpen] = useState(true);
  const [isAssignedOpen, setIsAssignedOpen] = useState(false);
  const [dialogConfig, setDialogConfig] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    type: 'success' | 'error' | 'info';
  }>({
    isOpen: false,
    title: '',
    message: '',
    type: 'info'
  });

  const [confirmationConfig, setConfirmationConfig] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {}
  });

  const toggleMoto = (id: number) => {
    setExpandedMotos(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const showDialog = (title: string, message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setDialogConfig({
      isOpen: true,
      title,
      message,
      type
    });
  };

  const closeDialog = () => {
    setDialogConfig(prev => ({ ...prev, isOpen: false }));
  };

  const showConfirmation = (title: string, message: string, onConfirm: () => void) => {
    setConfirmationConfig({
      isOpen: true,
      title,
      message,
      onConfirm
    });
  };

  const closeConfirmation = () => {
    setConfirmationConfig(prev => ({ ...prev, isOpen: false }));
  };





  async function loadTasks() {
    try {
      const { data } = await apiClient.get("/api/Task");
      if (data) {
        const mappedTasks = data
          .filter((t: any) => t.status !== 'Routed' && t.status !== 'Finished' && t.status !== 'Cancelada' && t.status !== 'finished' && t.status !== 'completed' && t.status !== 'concluída')
          .map((t: any) => ({
          id: t.id || t.ID,
          title: t.type || t.description || 'Sem título',
          date: t.deadline ? t.deadline.split('T')[0] : (t.creationDate ? t.creationDate.split('T')[0] : new Date().toISOString().split('T')[0]),
          priority: t.priority || 'MÉDIA',
          time: t.availableTimeStart || '',
          clientid: t.clientID || t.clientId,
          company_id: t.companyID || t.companyId || null,
          serviceid: t.serviceID || t.serviceId,
          motorcycleid: t.vehicleID || t.vehicleId || null,
          recurrence: t.recurrence || 'Pontual',
          status: t.status === 'Unassigned' ? 'POR CONCLUIR' : 'CONCLUÍDO',
          notes: t.description || '',
          instructions: t.instructions || '',
          street: t.street || '',
          door_number: t.door_number || '',
          floor: t.floor || '',
          postal_code: t.postal_code || '',
          city: t.city || ''
        }));
        setTasks(mappedTasks);
      }
    } catch (error) {
      console.error(error);
    }
  }

  async function loadVehicles() {
    try {
      // Assuming backend includes related Driver, Company, and Services
      const { data } = await apiClient.get("/api/Vehicle");
      const filtered = (data || []).filter((v: any) => {
        const s = (v.status || v.Status || "").toLowerCase();
        return s === "em uso" || s === "available" || s === "disponível";
      });
      setMotorcycles(filtered);
    } catch (error) {
      console.error(error);
    }
  }

  async function loadDrivers() {
    try {
      const { data } = await apiClient.get("/api/User");
      setDrivers(data || []);
    } catch (error) {
      console.error(error);
    }
  }

  useEffect(() => {
    loadTasks();
    loadVehicles();
    loadDrivers();

  }, []);


  // ------------------- HELPERS -------------------

// ------------------- HELPERS -------------------
const formatDate = (d: Date) => {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const priorityWeight = (p: string) => {
  if (p === 'ALTA') return 3;
  if (p === 'MÉDIA') return 2;
  return 1;
};

const sortedTasks = (tasksList: Task[]) => 
  [...tasksList].sort((a, b) => priorityWeight(b.priority) - priorityWeight(a.priority));

const filteredTasks = sortedTasks(tasks.filter(t => t.date === formatDate(selectedDate)));

const getMotorcycleTasks = (motoId: number) =>
  sortedTasks(tasks.filter(t => t.date === formatDate(selectedDate) && t.motorcycleid === motoId));

  const getDriverName = (motoId: number) => {
    const moto = motorcycles.find(m => m.id === motoId);
    if (!moto?.ownerID) return null;
    return drivers.find(d => d.id === moto.ownerID)?.name || null;
  };

  const getPriorityColor = (p: string) =>
    p === "ALTA" ? "bg-red-500" :
    p === "MÉDIA" ? "bg-orange-500" :
    "bg-green-500";

  const availableVehicles = useMemo(() => {
    if (selectedTasks.length === 0) return [];
    
    // We check if the vehicle supports the service of the first selected task
    // Alternatively, we could check if it supports all services of all selected tasks
    const requiredServiceId = selectedTasks[0].serviceid;
    if (!requiredServiceId) return motorcycles;

    return motorcycles.filter((vehicle) => {
      const driver = vehicle.owner; // mapped from backend 'owner'
      if (!driver) return false;

      const company = driver.company;
      if (!company) return false;

      return company.services?.some(
        (service) => service.id === requiredServiceId
      ) ?? false;
    });
  }, [motorcycles, selectedTasks]);




  // ------------------- DELETE TASKS -------------------
  const handleDeleteTasks = async () => {
    if (selectedTasks.length === 0) return;
    if (!window.confirm(`Tem a certeza que deseja eliminar ${selectedTasks.length} tarefa(s)?`)) return;

    try {
      await Promise.all(selectedTasks.map(t => apiClient.delete(`/api/Task/${t.id}`)));
      setSelectedTasks([]);
      loadTasks();
    } catch (error) {
      console.error("Erro ao eliminar tarefas:", error);
      alert("Erro ao eliminar tarefas.");
    }
  };

  // ------------------- ASSIGN TASK -------------------
  const assignTaskToMoto = async (motoId: number) => {
    if (selectedTasks.length === 0) return;
    try {
      await Promise.all(selectedTasks.map(async (selectedTask) => {
        await apiClient.put(`/api/Task/${selectedTask.id}`, {
          id: selectedTask.id,
          type: selectedTask.title || "Sem título",
          description: selectedTask.notes || "Sem descrição",
          serviceID: selectedTask.serviceid ? Number(selectedTask.serviceid) : 1,
          clientID: selectedTask.clientid ? Number(selectedTask.clientid) : 1,
          status: "Assigned",
          deadline: selectedTask.date ? new Date(selectedTask.date).toISOString() : null,
          creationDate: new Date().toISOString(),
          vehicleID: motoId,
          street: selectedTask.street || null,
          door_number: selectedTask.door_number || null,
          floor: selectedTask.floor || null,
          postal_code: selectedTask.postal_code || null,
          city: selectedTask.city || null,
          instructions: selectedTask.instructions || null,
          notes: selectedTask.notes || null,
          priority: selectedTask.priority || null
        });
      }));

      setShowAssignModal(false);
      setSelectedTasks([]);
      setExpandedMotos(prev => ({ ...prev, [motoId]: true })); // Expand accordion automatically
      loadTasks(); 
    } catch (error) {
      console.error(error);
      alert("Erro ao atribuir tarefas");
    }
  }

  const handleOptimizeRoute = async (motoId: number) => {
    const list = getMotorcycleTasks(motoId);
    if (list.length === 0) return;

    const createRoute = async () => {
      // Fechar diálogo de confirmação primeiro
      closeConfirmation();
      
      try {
        await apiClient.post("/api/Route/optimize-for-vehicle", {
          vehicleId: motoId,
          date: formatDate(selectedDate),
          taskIds: list.map(t => t.id)
        });
        showDialog("Sucesso", "Rota criada", "success");
        // Pequeno atraso para garantir que o backend processou
        setTimeout(() => {
          loadTasks();
        }, 500);
      } catch (error) {
        console.error(error);
        showDialog("Erro", "Erro ao otimizar a rota.", "error");
      }
    };

    showConfirmation(
      "Confirmar criação de rota",
      "Tem a certeza que deseja fechar a rota com estas tarefas? Elas deixarão de aparecer nesta lista.",
      createRoute
    );
  };


  async function removeTask(taskId: number) {
    try {
      const taskToUpdate = tasks.find((t) => t.id === taskId);
      if (taskToUpdate) {
        await apiClient.put(`/api/Task/${taskId}`, {
          id: taskId,
          type: taskToUpdate.title || "Sem título",
          description: taskToUpdate.notes || "Sem descrição",
          serviceID: taskToUpdate.serviceid ? Number(taskToUpdate.serviceid) : 1,
          clientID: taskToUpdate.clientid ? Number(taskToUpdate.clientid) : 1,
          status: "Unassigned",
          deadline: taskToUpdate.date ? new Date(taskToUpdate.date).toISOString() : null,
          creationDate: new Date().toISOString(),
          vehicleID: null,
          street: taskToUpdate.street || null,
          door_number: taskToUpdate.door_number || null,
          floor: taskToUpdate.floor || null,
          postal_code: taskToUpdate.postal_code || null,
          city: taskToUpdate.city || null,
          instructions: taskToUpdate.instructions || null,
          notes: taskToUpdate.notes || null,
          priority: taskToUpdate.priority || null
        });
      }
      loadTasks();
    } catch (error) {
      console.error(error);
    }
  }

function sortTasksSmart(tasks: Task[]) {
  return [...tasks].sort((a, b) => {
    const aAssigned = a.motorcycleid !== null;
    const bAssigned = b.motorcycleid !== null;

    if (aAssigned !== bAssigned) {
      return aAssigned ? 1 : -1;
    }

    if (!a.time && !b.time) return 0;
    if (!a.time) return 1;
    if (!b.time) return -1;

    return a.time.localeCompare(b.time);
  });
}


  // ------------------- UI -------------------
  const daysInMonth = new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1).getDay();


  return (
    <div className="flex flex-col lg:flex-row h-full">

      {/* LEFT - Tarefas */}
      <div className="w-full lg:w-1/3 bg-white dark:bg-gray-800 border-b lg:border-b-0 lg:border-r p-4 flex flex-col">
        <h2 className="text-xl font-semibold mb-4">
          Tarefas — {selectedDate.toLocaleDateString("pt-PT")}
        </h2>
        <div className="flex-1 overflow-y-auto space-y-4">
          
          {/* Por Atribuir */}
          <div>
            <div 
              className="flex justify-between items-center cursor-pointer bg-gray-100 dark:bg-gray-700 p-2 rounded hover:bg-gray-200"
              onClick={() => setIsUnassignedOpen(!isUnassignedOpen)}
            >
              <h3 className="font-semibold text-gray-700 dark:text-gray-200">Por Atribuir</h3>
              {isUnassignedOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </div>
            
            {isUnassignedOpen && (
              <div className="mt-3 space-y-3">
                {sortTasksSmart(filteredTasks.filter(t => t.motorcycleid === null)).map(task => {
                  const isSelected = selectedTasks.some(t => t.id === task.id);
                  return (
                  <div key={task.id}
                    className={`border rounded-lg p-3 cursor-pointer hover:shadow transition-colors ${
                      isSelected ? "border-black bg-gray-50 dark:bg-gray-700/50 ring-1 ring-black" : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
                    }`}
                    onClick={() => {
                      if (isSelected) {
                        setSelectedTasks(selectedTasks.filter(t => t.id !== task.id));
                      } else {
                        setSelectedTasks([...selectedTasks, task]);
                      }
                    }}
                  >
                    <div className="flex justify-between items-center mb-1">
                      <div className="flex items-center gap-2">
                        <div className={`w-4 h-4 rounded border flex items-center justify-center ${isSelected ? 'bg-black border-black' : 'border-gray-400'}`}>
                          {isSelected && <span className="text-white text-xs">✓</span>}
                        </div>
                        <span className="font-medium">{task.title}</span>
                      </div>
                      <span className={`text-white text-xs px-2 py-1 rounded-full ${getPriorityColor(task.priority)}`}>
                        {task.priority}
                      </span>
                    </div>
                    {task.street && (
                      <div className="text-sm text-gray-500 dark:text-gray-400 mt-1 space-y-1">
                        <div className="flex items-center gap-1">
                          <MapPin size={14} />
                          {task.street} {task.door_number} · {task.city}
                        </div>
                      </div>
                    )}   
                  </div>
                  );
                })}
                {filteredTasks.filter(t => t.motorcycleid === null).length === 0 && (
                  <p className="text-sm text-gray-500 dark:text-gray-400 text-center p-2">Não há tarefas por atribuir.</p>
                )}
              </div>
            )}
          </div>

          {/* Atribuídas */}
          <div>
            <div 
              className="flex justify-between items-center cursor-pointer bg-gray-100 dark:bg-gray-700 p-2 rounded hover:bg-gray-200 mt-2"
              onClick={() => setIsAssignedOpen(!isAssignedOpen)}
            >
              <h3 className="font-semibold text-gray-700 dark:text-gray-200">Atribuídas</h3>
              {isAssignedOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </div>
            
            {isAssignedOpen && (
              <div className="mt-3 space-y-3">
                {sortTasksSmart(filteredTasks.filter(t => t.motorcycleid !== null)).map(task => (
                  <div key={task.id}
                    className="border bg-green-50 border-green-300 rounded-lg p-3 cursor-pointer hover:shadow"
                    onClick={() => setSelectedTasks(prev => prev.some(t => t.id === task.id) ? prev : [...prev, task])}
                  >
                    <div className="flex justify-between">
                      <span>{task.title}</span>
                      <span className={`text-white text-xs px-2 py-1 rounded-full ${getPriorityColor(task.priority)}`}>
                        {task.priority}
                      </span>
                    </div>
                    {task.street && (
                      <div className="text-sm text-gray-500 dark:text-gray-400 mt-1 space-y-1">
                        <div className="flex items-center gap-1">
                          <MapPin size={14} />
                          {task.street} {task.door_number} · {task.city}
                        </div>
                      </div>
                    )}   
                  </div>
                ))}
                {filteredTasks.filter(t => t.motorcycleid !== null).length === 0 && (
                  <p className="text-sm text-gray-500 dark:text-gray-400 text-center p-2">Nenhuma tarefa atribuída ainda.</p>
                )}
              </div>
            )}
          </div>

        </div>
      </div>


      {/* MID - Motos Atribuídas */}
      <div className="w-full lg:w-1/3 bg-white dark:bg-gray-800 border-b lg:border-b-0 lg:border-r p-4 overflow-y-auto">
<h2 className="text-xl font-semibold mb-4">
  Tarefas Atribuídas
</h2>

        {motorcycles.map(moto => {
          const list = getMotorcycleTasks(moto.id);
          const driverName = getDriverName(moto.id);

          return (
            <div key={moto.id} className="mb-6">
              <div className="flex justify-between items-start gap-2">
                <div className="min-w-0">
                  <h3 className="font-medium truncate">{moto.name}</h3>
                  <p className="text-sm text-blue-600 truncate">
                    {driverName ? `Condutor: ${driverName}` : "Sem condutor"}
                  </p>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full text-xs whitespace-nowrap">
                    {list.length} tarefas
                  </span>
                  {list.length > 0 && (
                    <button onClick={() => toggleMoto(moto.id)} className="p-1 hover:bg-gray-100 dark:bg-gray-700 rounded-full flex-shrink-0">
                      {expandedMotos[moto.id] ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                    </button>
                  )}
                </div>
              </div>

              {list.length > 0 ? (
                expandedMotos[moto.id] && (
                  <div className="mt-3">
                    {list.map((t, i) => (
                      <div
                        key={t.id}
                        className="bg-white dark:bg-gray-800 border rounded-lg p-3 mt-3 shadow-sm"
                      >
      <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
          <span className="w-6 h-6 flex items-center justify-center bg-black text-white text-xs rounded-full">
            {i + 1}
          </span>
          <h4 className="font-semibold text-sm">{t.title}</h4>
          
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600 dark:text-gray-300">{t.time}</span>
          <button onClick={() => removeTask(t.id)}>
            <Trash2 size={18} className="text-red-500 hover:text-red-700" />
          </button>
        </div>
      </div>
    </div>
                    ))}
                    <button 
                      onClick={() => handleOptimizeRoute(moto.id)} 
                      className="w-full mt-4 px-4 py-2 bg-black text-white rounded text-sm hover:bg-gray-800 transition-colors"
                    >
                      Fechar Rota
                    </button>
                  </div>
                )
              ) : (
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 border rounded p-2 text-center">
                  Nenhuma tarefa atribuída
                </p>
              )}
            </div>
          );
        })}

      </div>


      <div className="w-full lg:w-1/3 bg-white dark:bg-gray-800 flex flex-col">

        <div className="p-4 border-b flex justify-between items-center">
          <button onClick={() => setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth() - 1, 1))}>
            <ChevronLeft/>
          </button>
          <h3 className="font-semibold">
            {selectedDate.toLocaleString("pt-PT", {month:"long"})} de {selectedDate.getFullYear()}
          </h3>
          <button onClick={() => setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 1))}>
            <ChevronRight/>
          </button>
        </div>

        <div className="grid grid-cols-7 p-4 gap-1">
          {Array.from({ length: firstDayOfMonth }).map((_, i) =>
            <div key={i} className="aspect-square"/>
          )}

          {Array.from({ length: daysInMonth }).map((_, i) => {
            const d = i + 1;
            const dt = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), d);
            const hasTasks = tasks.some(t => t.date === formatDate(dt));

            return (
              <button key={d}
                className={`aspect-square border p-1 text-sm flex flex-col justify-between ${
                  dt.toDateString() === selectedDate.toDateString()
                    ? "bg-black text-white"
                    : "hover:bg-gray-100 dark:bg-gray-700"
                }`}
                onClick={() => setSelectedDate(dt)}
              >
                <span>{d}</span>
                {hasTasks && <div className="w-2 h-2 rounded-full bg-blue-500 self-center mb-1"/>}
              </button>
            );
          })}
        </div>

        {selectedTasks.length > 0 && (
          <>
            <div className="border-t p-4">
              <div className="flex justify-between items-center">
                <h3 className="font-semibold">{selectedTasks.length} {selectedTasks.length === 1 ? 'tarefa selecionada' : 'tarefas selecionadas'}</h3>
                <X className="cursor-pointer" onClick={() => setSelectedTasks([])}/>
              </div>
              
              <button
                className="w-full mt-3 bg-black text-white py-2 rounded"
                onClick={() => setShowAssignModal(true)}
              >
                Atribuir {selectedTasks.length > 1 ? 'Todas' : ''}
              </button>
            </div>

            <div className="mt-auto p-4">
              <button
                className="w-full bg-red-600 text-white py-2 rounded flex items-center justify-center gap-2 hover:bg-red-700"
                onClick={() => handleDeleteTasks()}
              >
                <Trash2 size={18} />
                Eliminar {selectedTasks.length > 1 ? 'Todas' : ''}
              </button>
            </div>
          </>
        )}

      </div>

      {showAssignModal && selectedTasks.length > 0 && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center">
          <div className="bg-white dark:bg-gray-800 p-4 rounded w-80">
            <h3 className="font-semibold mb-3">Selecionar mota</h3>

            {availableVehicles.length > 0 ? (
            availableVehicles.map((vehicle) => (
           <button
            key={vehicle.id}
            className="w-full border p-2 mb-2 rounded hover:bg-gray-100 dark:bg-gray-700 text-left"
            onClick={() => assignTaskToMoto(vehicle.id)}
            >
            <div className="font-semibold">{vehicle.name}</div>
             <div className="text-sm text-gray-500 dark:text-gray-400">
              Empresa: {vehicle.owner?.company?.name || "Sem Empresa"}
              </div>

           </button>
  ))
) : (
  <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
    Nenhuma mota compatível com o serviço desta tarefa
  </p>
)}
            <button className="w-full mt-2 py-2 bg-gray-300 rounded"
              onClick={() => setShowAssignModal(false)}
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      <CustomDialog
        isOpen={dialogConfig.isOpen}
        onClose={closeDialog}
        title={dialogConfig.title}
        message={dialogConfig.message}
        type={dialogConfig.type}
      />
      
      <ConfirmationDialog
        isOpen={confirmationConfig.isOpen}
        onClose={closeConfirmation}
        onConfirm={confirmationConfig.onConfirm}
        title={confirmationConfig.title}
        message={confirmationConfig.message}
      />
    </div>
  );
};

export default TaskAssignmentPage;
