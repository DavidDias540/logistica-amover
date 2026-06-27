import React, { useEffect, useState } from "react";
import { Search, AlertCircle, X, CheckCircle } from "lucide-react";
import { apiClient } from "../api/client";

interface Motorcycle {
  id: number;
  name: string;
  vid: string;
  status: string;
}

interface Maintenance {
  id: number;
  motorcycleid: number;
  description: string;
  date: string;
  resolved: boolean;
}

const MaintenancePage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [motorcycles, setMotorcycles] = useState<Motorcycle[]>([]);
  const [maintenance, setMaintenance] = useState<Maintenance[]>([]);

  const [selectedMoto, setSelectedMoto] = useState<Motorcycle | null>(null);
  const [maintenanceReason, setMaintenanceReason] = useState("");

  const [selectedMotoForRemoval, setSelectedMotoForRemoval] = useState<Motorcycle | null>(null);

  // ------------------- LOAD DATA -------------------
  async function loadMotorcycles() {
    try {
      const { data } = await apiClient.get("/api/Vehicle");
      setMotorcycles(data || []);
    } catch (error) {
      console.error(error);
    }
  }

  async function loadMaintenance() {
    try {
      const { data } = await apiClient.get("/api/Vehicle/maintenance?resolved=false");
      setMaintenance(data || []);
    } catch (error) {
      console.error(error);
    }
  }

  useEffect(() => {
    loadMotorcycles();
    loadMaintenance();
  }, []);

  // ------------------- ACTIONS -------------------
  async function handleMaintenanceSubmit() {
    if (!selectedMoto || !maintenanceReason) return;

    try {
      await apiClient.post("/api/Vehicle/maintenance", {
        motorcycleid: selectedMoto.id,
        description: maintenanceReason,
        date: new Date().toISOString(),
        resolved: false
      });

      await apiClient.patch(`/api/Vehicle/${selectedMoto.id}/status`, { status: "Manutenção" });
    } catch (error) {
      console.error(error);
      alert("Erro ao enviar para manutenção");
    }

    setSelectedMoto(null);
    setMaintenanceReason("");
    loadMotorcycles();
    loadMaintenance();
  }

  async function handleRemoveFromMaintenance() {
    if (!selectedMotoForRemoval) return;

    try {
      const maint = getMaintenanceDetails(selectedMotoForRemoval.id);
      if (maint) {
        await apiClient.put(`/api/Vehicle/maintenance/resolve/${maint.id}`, {
          resolved: true
        });
      }

      // 2️⃣ Atualizar status da mota para "Disponível"
      await apiClient.patch(`/api/Vehicle/${selectedMotoForRemoval.id}/status`, { status: "Disponível" });
    } catch (error) {
      console.error(error);
      alert("Erro ao remover de manutenção");
    }

    setSelectedMotoForRemoval(null);

    // 3️⃣ Recarrega dados para atualizar UI
    await loadMotorcycles();
    await loadMaintenance();
  }


  // ------------------- FILTERS -------------------
  const filteredMotorcycles = motorcycles.filter((m) =>
    (m.vid || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    (m.name || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getMaintenanceDetails = (motoId: number) =>
    maintenance.find((m) => m.motorcycleid === motoId);

  const getStatusBadgeClass = (status: string) => {
  switch (status) {
    case "Em uso":
      return "bg-orange-100 text-orange-600"; // LARANJA
    case "Manutenção":
      return "bg-red-100 text-red-600"; // VERMELHO
    case "Disponível":
      return "bg-green-100 text-green-600"; // VERDE
    default:
      return "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300";
  }
};

const getStatusLabel = (status: string) => {
  if (status === "Em uso") return "Em Uso";
  return status;
};

  return (
    <div className="flex flex-col h-full bg-background dark:bg-transparent p-4">
      {/* Search */}
      <div className="mb-6">
        <div className="relative">
          <input
            type="text"
            placeholder="Pesquisar por matrícula..."
            className="w-full bg-white dark:bg-gray-800 rounded-md py-2 pl-10 pr-4 border"
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Search className="absolute left-3 top-2.5 text-gray-400" size={20} />
        </div>
      </div>

      {/* MOTAS EM MANUTENÇÃO */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 mb-6">
        <h2 className="text-lg font-semibold mb-4">Motas em Manutenção</h2>
        <div className="space-y-3">
          {filteredMotorcycles
            .filter((m) => m.status === "Manutenção")
            .map((moto) => {
              const maint = getMaintenanceDetails(moto.id);
              return (
                <div key={moto.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium">{moto.name}</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Matrícula: {moto.vid}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Motivo: {maint?.description}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Data: {maint?.date.split("T")[0]}
                      </p>
                    </div>

                    <div className="flex flex-col items-end gap-2">
                      
                      <span
                       className={`px-3 py-1 rounded-full text-sm ${getStatusBadgeClass(moto.status)}`} >
                         {getStatusLabel(moto.status)}
                      </span>

                      <button
                        className="text-sm text-blue-600 hover:text-blue-800"
                        onClick={() => setSelectedMotoForRemoval(moto)}
                      >
                        Remover da Manutenção
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
        </div>
      </div>

      {/* MOTAS DISPONÍVEIS */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
        <h2 className="text-lg font-semibold mb-4">Motas Disponíveis</h2>
        <div className="space-y-3">
          {filteredMotorcycles
            .filter((m) => m.status !== "Manutenção")
            .map((moto) => (
              <div
                key={moto.id}
                className="border p-4 rounded-lg cursor-pointer hover:border-gray-300 dark:border-gray-600"
                onClick={() => setSelectedMoto(moto)}
              >
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-medium">{moto.name}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Matrícula: {moto.vid}</p>
                  </div>
                  <span
  className={`px-3 py-1 rounded-full text-sm ${getStatusBadgeClass(moto.status)}`}
>
  {getStatusLabel(moto.status)}
</span>

                </div>
              </div>
            ))}
        </div>
      </div>

      {/* Modal ADICIONAR */}
      {selectedMoto && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl w-full max-w-md">
            <div className="flex justify-between p-4 border-b">
              <h3 className="font-semibold">Enviar para Manutenção</h3>
              <X className="cursor-pointer" onClick={() => setSelectedMoto(null)} />
            </div>

            <div className="p-6">
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-2">
                  <AlertCircle className="text-orange-500" size={20} />
                  <span className="text-sm text-gray-600 dark:text-gray-300">Está a enviar para manutenção:</span>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg">
                  <h4 className="font-medium">{selectedMoto.name}</h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Matrícula: {selectedMoto.vid}
                  </p>
                </div>
              </div>

              <textarea
                placeholder="Descreva o motivo..."
                className="w-full border rounded-lg p-3 h-28"
                onChange={(e) => setMaintenanceReason(e.target.value)}
              />

              <div className="flex gap-3 mt-6">
                <button
                  className="flex-1 bg-gray-200 py-2 rounded-lg"
                  onClick={() => setSelectedMoto(null)}
                >
                  Cancelar
                </button>
                <button
                  className="flex-1 bg-[#333] text-white py-2 rounded-lg disabled:opacity-50"
                  disabled={!maintenanceReason}
                  onClick={handleMaintenanceSubmit}
                >
                  Confirmar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal REMOVER */}
      {selectedMotoForRemoval && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl w-full max-w-md">
            <div className="flex justify-between p-4 border-b">
              <h3 className="font-semibold">Remover da Manutenção</h3>
              <X
                className="cursor-pointer"
                onClick={() => setSelectedMotoForRemoval(null)}
              />
            </div>

            <div className="p-6">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="text-green-500" size={20} />
                <span className="text-sm text-gray-600 dark:text-gray-300">Está a remover da manutenção:</span>
              </div>

              <div className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg mb-4">
                <h4 className="font-medium">{selectedMotoForRemoval.name}</h4>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Matrícula: {selectedMotoForRemoval.vid}
                </p>
              </div>

              <p className="text-sm text-gray-600 dark:text-gray-300 mb-6">
                Após confirmar, a mota ficará disponível novamente.
              </p>

              <div className="flex gap-3">
                <button
                  className="flex-1 bg-gray-200 py-2 rounded-lg"
                  onClick={() => setSelectedMotoForRemoval(null)}
                >
                  Cancelar
                </button>
                <button
                  className="flex-1 bg-[#333] text-white py-2 rounded-lg"
                  onClick={handleRemoveFromMaintenance}
                >
                  Confirmar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MaintenancePage;
