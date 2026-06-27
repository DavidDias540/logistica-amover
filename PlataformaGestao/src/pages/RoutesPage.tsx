import { useEffect, useState, useMemo } from "react";
import { apiClient } from "../api/client";
import { Bike, MapPin, Clock, ArrowLeft, ChevronDown, ChevronUp } from "lucide-react";

import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors
} from "@dnd-kit/core";

import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  arrayMove
} from "@dnd-kit/sortable";

import { CSS } from "@dnd-kit/utilities";

/* ================= TYPES ================= */

interface Motorcycle {
  id: number;
  name: string;
  status: string;
  matricula?: string;
  owner?: {
    id: number;
    name: string;
  };
}

interface Task {
  id: number;
  title: string;
  date: string;
  time: string;
  priority: "ALTA" | "MÉDIA" | "BAIXA";
  status?: string;
  motorcycleid: number | null;
  clientid: number | null;

  street?: string | null;
  door_number?: string | null;
  floor?: string | null;
  postal_code?: string | null;
  city?: string | null;
}

interface RoutePoint {
  id: number;
  stop_order: number;
  task: Task;
}

interface RouteGroup {
  id: string;
  vehicle_id: number;
  route_date: string;
  isOptimized: boolean;
  driverName?: string | null;
  routePoints: RoutePoint[];
}

interface CanceledRouteLog {
  id: number;
  routeGroupId: string;
  vehicleID: number;
  cancelationDate: string;
  reason: string;
  comment: string;
  returnedToUnassigned: boolean;
  taskIds: string;
}

/* ================= SORTABLE TASK ================= */

function SortableTask({
  task,
  index,
  isSaved
}: {
  task: Task;
  index: number;
  isSaved: boolean;
}): JSX.Element {

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition
  };

  const address = task.street
    ? `${task.street} ${task.door_number ?? ""} · ${task.city ?? ""}`
    : "Sem morada";

  function getPriorityColor(priority: Task["priority"]) {
    switch (priority) {
      case "ALTA":
        return "bg-red-500 text-white";
      case "MÉDIA":
        return "bg-orange-500 text-white";
      case "BAIXA":
        return "bg-green-500 text-white";
      default:
        return "bg-gray-200";
    }
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`p-4 rounded shadow cursor-grab ${
        isSaved
          ? "bg-green-50 border border-green-300"
          : "bg-white dark:bg-gray-800"
      }`}
    >
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-full bg-black text-white text-xs flex items-center justify-center">
            {index + 1}
          </div>
          <p className="font-medium">{task.title}</p>
        </div>
        <span
          className={`text-xs px-2 py-1 rounded-full ${getPriorityColor(task.priority)}`}
        >
          {task.priority}
        </span>
      </div>

      <div className="text-sm text-gray-600 dark:text-gray-300 mt-1 flex items-center gap-1">
        <MapPin size={14} />
        {address}
      </div>
      
    </div>
  );
}

/* ================= COMPONENT ================= */

const RoutesPage = ({ vehicleId, date }: any) => {

  const [motorcycles, setMotorcycles] = useState<Motorcycle[]>([]);
  const [selectedMotorcycle, setSelectedMotorcycle] = useState<Motorcycle | null>(null);

  const [selectedDate, setSelectedDate] = useState(
    date ? date.toISOString().split("T")[0] : new Date().toISOString().split("T")[0]
  );

  const [routes, setRoutes] = useState<RouteGroup[]>([]);
  const [expandedRoutes, setExpandedRoutes] = useState<Record<string, boolean>>({});
  const [activeTab, setActiveTab] = useState<'ongoing' | 'completed'>('ongoing');

  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [cancelHistory, setCancelHistory] = useState<CanceledRouteLog[]>([]);

  const [routeToCancel, setRouteToCancel] = useState<string | null>(null);
  const [cancelReason, setCancelReason] = useState("Problema com a viatura");
  const [cancelComment, setCancelComment] = useState("");
  const [returnToUnassigned, setReturnToUnassigned] = useState(true);

  const sensors = useSensors(useSensor(PointerSensor));

  /* ================= LOAD DATA ================= */

  useEffect(() => {
    loadMotorcycles();
  }, []);

  useEffect(() => {
    if (!selectedMotorcycle) return;
    loadRoute();
  }, [selectedMotorcycle, selectedDate]);

  useEffect(() => {
    if (!vehicleId || motorcycles.length === 0) return;
    const moto = motorcycles.find(m => m.id === vehicleId);
    if (moto) setSelectedMotorcycle(moto);
  }, [vehicleId, motorcycles]);

  async function loadMotorcycles() {
    try {
      const { data } = await apiClient.get("/api/Vehicle");
      setMotorcycles(data || []);
    } catch (error) {
      console.error(error);
    }
  }

  async function loadRoute() {
    if (!selectedMotorcycle) return;

    try {
      // Always use vehicle endpoint in management platform so history shows
      // ALL routes done on this vehicle, with the driverName of whoever did each route
      const endpoint = `/api/Route?vehicleId=${selectedMotorcycle.id}&date=${selectedDate}`;

      const { data } = await apiClient.get(endpoint);
      const routesData = Array.isArray(data) ? data : [];
      
      const normalizedRoutes = routesData.map((routeObj: any) => ({
        id: routeObj.id,
        vehicle_id: routeObj.vehicle_id,
        route_date: routeObj.route_date,
        isOptimized: routeObj.isOptimized,
        driverName: routeObj.driverName || null,
        routePoints: (routeObj.routePoints || routeObj.route_points || []).map((rp: any) => {
          const rawTask = Array.isArray(rp.task) ? rp.task[0] : rp.task;
          return {
            id: rp.id,
            stop_order: rp.stopOrder || rp.stop_order,
            driverName: rp.driverName || null,
            task: {
              ...rawTask,
              title: rawTask?.type || rawTask?.description || 'Sem título'
            }
          };
        })
      }));

      setRoutes(normalizedRoutes);

      // Expand all routes by default
      const newExpanded: Record<string, boolean> = {};
      normalizedRoutes.forEach((r: any) => {
        newExpanded[r.id] = true;
      });
      setExpandedRoutes(newExpanded);

    } catch (error) {
      console.error(error);
      setRoutes([]);
    }
  }

  const toggleRouteAccordion = (routeId: string) => {
    setExpandedRoutes(prev => ({
      ...prev,
      [routeId]: !prev[routeId]
    }));
  };

  /* ================= DRAG & DROP ================= */

  async function handleDragEnd(event: any, routeIndex: number) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    if (!window.confirm("Atenção! Está prestes a alterar manualmente a ordem de uma rota já fechada e otimizada. Tem a certeza que deseja guardar esta alteração?")) {
      return;
    }

    const routeObj = routes[routeIndex];
    const oldIndex = routeObj.routePoints.findIndex(rp => rp.task.id === active.id);
    const newIndex = routeObj.routePoints.findIndex(rp => rp.task.id === over.id);

    const reordered = arrayMove(routeObj.routePoints, oldIndex, newIndex);
    
    // Update state optimistically
    const newRoutes = [...routes];
    newRoutes[routeIndex].routePoints = reordered.map((rp, i) => ({ ...rp, stop_order: i + 1 }));
    setRoutes(newRoutes);

    try {
      for (let i = 0; i < reordered.length; i++) {
        const rp = reordered[i];
        await apiClient.put(`/api/Route/node/${rp.id}`, { stop_order: i + 1, stopOrder: i + 1 });
      }
      loadRoute();
    } catch (error) {
      console.error(error);
      alert("Erro ao gravar a nova ordem da rota.");
    }
  }

    async function loadCancelHistory() {
    try {
      const { data } = await apiClient.get('/api/Route/cancelations');
      setCancelHistory(data || []);
      setShowHistoryModal(true);
    } catch (error) {
      console.error(error);
      alert("Erro ao carregar histórico");
    }
  }

  async function handleCancelRoute() {
    if (!routeToCancel) return;
    try {
      await apiClient.post(`/api/Route/group/${routeToCancel}/cancel`, {
        reason: cancelReason,
        comment: cancelComment,
        returnToUnassigned
      });
      setRouteToCancel(null);
      setCancelReason("Problema com a viatura");
      setCancelComment("");
      setReturnToUnassigned(true);
      loadRoute();
      alert("Rota cancelada com sucesso!");
    } catch (error) {
      console.error(error);
      alert("Erro ao cancelar rota.");
    }
  }

  /* ================= UI ================= */

  return (
    <div className="bg-gray-100 dark:bg-gray-700 p-6 h-full flex flex-col">

      {!selectedMotorcycle && (
        <>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Rotas por Mota</h2>
            <button 
              onClick={loadCancelHistory}
              className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 px-4 py-2 rounded shadow-sm hover:bg-gray-50 dark:bg-gray-700/50 text-sm font-medium"
            >
              Histórico de Cancelamentos
            </button>
          </div>

          <input
            type="date"
            value={selectedDate}
            onChange={e => setSelectedDate(e.target.value)}
            className="border rounded px-2 py-1 mb-4"
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {motorcycles.map(moto => (
              <div
                key={moto.id}
                onClick={() => setSelectedMotorcycle(moto)}
                className="bg-white dark:bg-gray-800 p-4 rounded shadow cursor-pointer hover:shadow-md transition-shadow flex flex-col gap-1"
              >
                <div className="flex items-center gap-2 font-medium min-w-0">
                  <Bike size={20} className="text-gray-600 dark:text-gray-300 flex-shrink-0" />
                  <span className="truncate">{moto.name}</span>
                </div>
                {moto.matricula && (
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    Matrícula: <span className="font-medium text-gray-700 dark:text-gray-200">{moto.matricula}</span>
                  </div>
                )}
                <div className="text-sm text-gray-500 dark:text-gray-400 mt-1 truncate">
                  Condutor: {moto.owner ? <span className="font-medium text-gray-700 dark:text-gray-200">{moto.owner.name}</span> : <span className="italic text-gray-400">Não atribuído</span>}
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {selectedMotorcycle && (
        <>
          <div className="flex items-center gap-3 mb-4">
            <button onClick={() => setSelectedMotorcycle(null)}>
              <ArrowLeft size={16}/> Voltar
            </button>
            <h2 className="text-xl font-semibold">
              Rotas - {selectedMotorcycle.name} {selectedMotorcycle.owner ? <span className="text-gray-500 dark:text-gray-400 font-normal text-base ml-2">(Condutor: {selectedMotorcycle.owner.name})</span> : <span className="text-gray-400 font-normal text-base ml-2">(Sem condutor associado)</span>}
            </h2>
          </div>

          <input
            type="date"
            value={selectedDate}
            onChange={e => setSelectedDate(e.target.value)}
            className="border rounded px-2 py-1 mb-4"
          />

          <div className="flex gap-6 flex-1 overflow-hidden min-h-[500px]">

            <div className="w-1/2 flex flex-col pr-2 pb-20 h-full">
                <div className="flex border-b border-gray-200 dark:border-gray-700 mb-4 flex-shrink-0">
                  <button
                    className={`flex-1 py-2 text-center text-sm font-medium transition-colors ${activeTab === 'ongoing' ? 'text-[#3E8B54] border-b-2 border-[#3E8B54]' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:bg-gray-700/50'}`}
                    onClick={() => setActiveTab('ongoing')}
                  >
                    Rotas em Andamento
                  </button>
                  <button
                    className={`flex-1 py-2 text-center text-sm font-medium transition-colors ${activeTab === 'completed' ? 'text-[#3E8B54] border-b-2 border-[#3E8B54]' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:bg-gray-700/50'}`}
                    onClick={() => setActiveTab('completed')}
                  >
                    Histórico de Rotas
                  </button>
                </div>

              <div className="overflow-y-auto space-y-4 flex-1">
              {(() => {
                const filteredRoutes = routes.filter(routeObj => {
                  const isCompleted = routeObj.routePoints.every(rp => {
                    const status = (rp.task.status || "").toLowerCase();
                    return status === "finished";
                  });
                  return activeTab === 'ongoing' ? !isCompleted : isCompleted;
                });

                if (filteredRoutes.length === 0) {
                  return (
                    <p className="text-gray-500 dark:text-gray-400">
                      {activeTab === 'ongoing' ? "Sem rotas em andamento." : "Sem rotas no histórico para esta data."}
                    </p>
                  );
                }

                return filteredRoutes.map((routeObj, routeIndex) => {
                const isCompleted = routeObj.routePoints.every(rp => {
                  const status = (rp.task.status || "").toLowerCase();
                  return status === "finished";
                });

                return (
                  <div key={routeObj.id} className="border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700/50 overflow-hidden">
                    <div 
                      className="bg-white dark:bg-gray-800 p-3 border-b border-gray-300 dark:border-gray-600 flex justify-between items-center cursor-pointer hover:bg-gray-100 dark:bg-gray-700"
                      onClick={() => toggleRouteAccordion(routeObj.id)}
                    >
                      <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-gray-800 dark:text-gray-100">Rota {routeIndex + 1}</span>
                          {isCompleted && (
                            <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-bold rounded-full">
                              Concluída
                            </span>
                          )}
                        </div>
                        <span className="text-xs text-gray-500 dark:text-gray-400">{routeObj.routePoints.length} tarefas associadas</span>
                        {routeObj.driverName && (
                          <span className="text-xs text-blue-600 font-medium mt-0.5">
                            Condutor: {routeObj.driverName}
                          </span>
                        )}
                      </div>
                      {expandedRoutes[routeObj.id] ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                    </div>

                    {expandedRoutes[routeObj.id] && (
                      <div className="p-4 space-y-3">
                        <DndContext
                          sensors={sensors}
                          collisionDetection={closestCenter}
                          onDragEnd={(event) => handleDragEnd(event, routeIndex)}
                        >
                          <SortableContext
                            items={routeObj.routePoints.map(rp => rp.task.id)}
                            strategy={verticalListSortingStrategy}
                          >
                            {routeObj.routePoints.map((rp, idx) => (
                              <SortableTask
                                key={rp.task.id}
                                task={rp.task}
                                index={idx}
                                isSaved={true}
                              />
                            ))}
                          </SortableContext>
                        </DndContext>
                        {!isCompleted && (
                          <div className="mt-4 border-t border-gray-200 dark:border-gray-700 pt-3">
                            <button
                              onClick={() => setRouteToCancel(routeObj.id)}
                              className="w-full py-2 bg-red-50 text-red-600 font-medium text-sm rounded hover:bg-red-100 transition-colors border border-red-200"
                            >
                              Cancelar Rota
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              });
              })()}
              </div>
            </div>

            <div className="w-1/2 bg-gray-200 rounded flex items-center justify-center relative h-full">
              <span className="text-gray-500 dark:text-gray-400 flex items-center gap-2">
                <MapPin />
                Visualização do mapa virá aqui
              </span>
            </div>

          </div>
        </>
      )}

      {/* Cancel Route Modal */}
      {routeToCancel && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg w-[400px] shadow-xl">
            <h3 className="text-lg font-bold mb-4">Cancelar Rota</h3>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Motivo</label>
              <select 
                value={cancelReason}
                onChange={e => setCancelReason(e.target.value)}
                className="w-full border rounded p-2"
              >
                <option value="Problema com a viatura">Problema com a viatura</option>
                <option value="Alteração de Horário">Alteração de Horário</option>
                <option value="Falta de Tempo">Falta de Tempo</option>
                <option value="Outro">Outro</option>
              </select>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Comentários</label>
              <textarea 
                value={cancelComment}
                onChange={e => setCancelComment(e.target.value)}
                className="w-full border rounded p-2 h-24"
                placeholder="Detalhes adicionais..."
              ></textarea>
            </div>

            <div className="mb-6 flex items-center gap-2">
              <input 
                type="checkbox" 
                id="returnToUnassigned"
                checked={returnToUnassigned}
                onChange={e => setReturnToUnassigned(e.target.checked)}
                className="w-4 h-4"
              />
              <label htmlFor="returnToUnassigned" className="text-sm text-gray-700 dark:text-gray-200 cursor-pointer">
                Devolver tarefas para nova atribuição
              </label>
            </div>

            <div className="flex justify-end gap-3">
              <button 
                onClick={() => setRouteToCancel(null)}
                className="px-4 py-2 border rounded text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:bg-gray-700/50"
              >
                Voltar
              </button>
              <button 
                onClick={handleCancelRoute}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 font-medium"
              >
                Confirmar Cancelamento
              </button>
            </div>
          </div>
        </div>
      )}

      {/* History Modal */}
      {showHistoryModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg w-[800px] max-h-[80vh] flex flex-col shadow-xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold">Histórico de Cancelamentos</h3>
              <button onClick={() => setShowHistoryModal(false)} className="text-gray-500 dark:text-gray-400 hover:text-black">
                ✕
              </button>
            </div>
            
            <div className="overflow-y-auto flex-1 border rounded">
              <table className="w-full text-left text-sm text-gray-600 dark:text-gray-300">
                <thead className="bg-gray-100 dark:bg-gray-700 sticky top-0">
                  <tr>
                    <th className="p-3 border-b font-semibold">Data</th>
                    <th className="p-3 border-b font-semibold">Mota ID</th>
                    <th className="p-3 border-b font-semibold">Motivo</th>
                    <th className="p-3 border-b font-semibold">Comentário</th>
                    <th className="p-3 border-b font-semibold text-center">Reatribuídas?</th>
                  </tr>
                </thead>
                <tbody>
                  {cancelHistory.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-4 text-center text-gray-500 dark:text-gray-400">Nenhum cancelamento registado.</td>
                    </tr>
                  ) : (
                    cancelHistory.map(log => (
                      <tr key={log.id} className="border-b hover:bg-gray-50 dark:bg-gray-700/50">
                        <td className="p-3">{new Date(log.cancelationDate).toLocaleString()}</td>
                        <td className="p-3">{log.vehicleID}</td>
                        <td className="p-3">{log.reason}</td>
                        <td className="p-3 max-w-[200px] truncate" title={log.comment}>{log.comment}</td>
                        <td className="p-3 text-center">
                          {log.returnedToUnassigned ? (
                            <span className="text-green-600 font-medium">Sim</span>
                          ) : (
                            <span className="text-red-600 font-medium">Não</span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RoutesPage;
