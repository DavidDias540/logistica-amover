import React, { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { apiClient } from '../api/client';
import { X , AlertCircle} from "lucide-react";
import { useAuth } from '../context/AuthContext';


const MotorcyclesPage: React.FC = () => {
  const { dbUser, role, companyId } = useAuth();
  const isManager = role === 'manager';
  const isAdmin = role === 'admin';

  const [dbMotorcycles, setDbMotorcycles] = useState<any[]>([]);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [dbDrivers, setDbDrivers] = useState<any[]>([]);
  const [companies, setCompanies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMotoMenu, setSelectedMotoMenu] = useState<any>(null);



  const [showAddModal, setShowAddModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedMotoForAssignment, setSelectedMotoForAssignment] = useState<any>(null);
  const [showEditModal, setShowEditModal] = useState(false);
const [selectedMotoForEdit, setSelectedMotoForEdit] = useState<any>(null);
const [selectedMotoForMaintenance, setSelectedMotoForMaintenance] = useState<any>(null);
const [maintenanceReason, setMaintenanceReason] = useState("");



  // FORM da mota nova
  const [newVehicle, setNewVehicle] = useState({
  matricula: '',
  name: '',
  marca: '',
  modelo: '',
  status: 'Disponível',
  battery_capacity: null as number | null,
  cargo_capacity: null as number | null,
  company_id: isManager ? companyId : (null as number | null),
});



  useEffect(() => {
    async function loadData() {
      try {
        const { data: motos } = await apiClient.get('/api/Vehicle');
        if (motos) {
          const filteredMotos = isManager
            ? motos.filter((m: any) => m.companyID === companyId || m.company_id === companyId)
            : motos;
          setDbMotorcycles(filteredMotos);
        }

        const { data: driversData } = await apiClient.get('/api/User');
        if (driversData) {
          let onlyDrivers = driversData.filter((u: any) => {
            const role = (u.role || u.Role || "").toLowerCase();
            return role === "driver" || role === "motorista";
          });
          if (isManager) {
            onlyDrivers = onlyDrivers.filter((d: any) => (d.companyID || d.company_id) === companyId);
          }
          setDbDrivers(onlyDrivers);
        }

        const { data: companiesData } = await apiClient.get('/api/Company');
        if (companiesData) setCompanies(companiesData);
      } catch (error) {
        console.error(error);
      }
      setLoading(false);
    }

    loadData();
  }, [isManager, companyId]);

  // Obter assignment ativo para uma mota (agora usamos o ownerID)
  const getActiveAssignment = (motorcycleId: number) => {
    const moto = dbMotorcycles.find(m => m.id === motorcycleId);
    if (!moto || !moto.ownerID) return null;
    const driver = dbDrivers.find(d => d.id === moto.ownerID);
    return driver ? { driverid: driver.id, name: driver.name } : null;
  };

  const openAssignModal = (moto: any) => {
    setSelectedMotoForAssignment(moto);
    setShowAssignModal(true);
  };

  // Drivers disponíveis = sem mota associada e da mesma empresa da mota
  const availableDrivers = selectedMotoForAssignment
    ? dbDrivers.filter(
        (d) =>
          (d.companyID || d.company_id) === (selectedMotoForAssignment.companyID || selectedMotoForAssignment.company_id) &&
          !dbMotorcycles.some((m) => m.ownerID === d.id)
      )
    : [];


 
  const assignMotorcycle = async (moto: any, driver: any) => {
    try {
      await apiClient.put(`/api/Vehicle/${moto.id}`, {
        ...moto,
        status: 'Em uso',         
        ownerID: driver.id,
      });

      setDbMotorcycles((prev) =>
        prev.map((m) =>
          m.id === moto.id
            ? { ...m, status: 'Em uso', ownerID: driver.id }
            : m
        )
      );

      setShowAssignModal(false);
      setSelectedMotoForAssignment(null);
    } catch (error) {
      console.error(error);
      alert('Erro ao atribuir mota.');
    }
  };


  const unassignMotorcycle = async (motoId: number) => {
    try {
      const moto = dbMotorcycles.find(m => m.id === motoId);
      if (!moto) return;
      await apiClient.put(`/api/Vehicle/${motoId}`, {
        ...moto,
        status: 'Disponível',
        ownerID: null,
      });

      setDbMotorcycles((prev) =>
        prev.map((m) =>
          m.id === motoId ? { ...m, status: 'Disponível', ownerID: null } : m
        )
      );
    } catch (error) {
      console.error('Erro ao desatribuir:', error);
      alert('Erro ao desatribuir.');
    }
  };

 
  const addMotorcycle = async () => {
    if (!newVehicle.name || !newVehicle.matricula || !newVehicle.marca || !newVehicle.modelo) {
      alert('Preenche os campos obrigatórios (Nome, Marca, Modelo, Matrícula)!');
      return;
    }

    try {
      const { data } = await apiClient.post('/api/Vehicle', {
        name: newVehicle.name,
        brand: newVehicle.marca,
        model: newVehicle.modelo,
        vid: newVehicle.matricula,
        status: 'Disponível',
        ownerID: null,
        batteryCapacity: newVehicle.battery_capacity,
        cargoCapacity: newVehicle.cargo_capacity,
        companyID: isManager ? companyId : newVehicle.company_id,
      });

      setDbMotorcycles((prev) => [...prev, data]);
      setShowAddModal(false);

      setNewVehicle({
        matricula: '',
        name: '',
        marca: '',
        modelo: '',
        status: 'Disponível',
        battery_capacity: null as number | null,
        cargo_capacity: null as number | null,
        company_id: isManager ? companyId : null,
      });
    } catch (error) {
      console.error(error);
      alert('Erro ao guardar a mota.');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Disponível':
        return 'text-green-600';
      case 'Em uso': 
        return 'text-orange-500';
      case 'Manutenção':
        return 'text-red-600';
      default:
        return 'text-gray-600 dark:text-gray-300';
    }
  };

  
  const getStatusLabel = (status: string) =>
    status === 'Em uso' ? 'Em Uso' : status;
const updateMotorcycle = async () => {
  if (!selectedMotoForEdit) return;

  try {
    await apiClient.put(`/api/Vehicle/${selectedMotoForEdit.id}`, {
      ...selectedMotoForEdit,
      name: selectedMotoForEdit.name,
      brand: selectedMotoForEdit.marca,
      model: selectedMotoForEdit.modelo,
      vid: selectedMotoForEdit.matricula,
      batteryCapacity: selectedMotoForEdit.battery_capacity,
      cargoCapacity: selectedMotoForEdit.cargo_capacity,
      status: selectedMotoForEdit.status,
      ownerID: selectedMotoForEdit.ownerID,
      companyID: isManager ? companyId : (selectedMotoForEdit.company_id || selectedMotoForEdit.companyID),
    });

    setDbMotorcycles(prev =>
      prev.map(m =>
        m.id === selectedMotoForEdit.id ? selectedMotoForEdit : m
      )
    );

    setShowEditModal(false);
    setSelectedMotoForEdit(null);
  } catch (error) {
    console.error(error);
    alert("Erro ao atualizar mota.");
  }
};
const deleteMotorcycle = async (moto: any) => {
  if (moto.status === "Em uso") {
    alert("Não podes apagar uma mota que está em uso.");
    return;
  }

  if (!confirm("Tens a certeza que queres apagar esta mota?")) return;

  try {
    await apiClient.delete(`/api/Vehicle/${moto.id}`);
    setDbMotorcycles(prev => prev.filter(m => m.id !== moto.id));
  } catch (error) {
    console.error(error);
    alert("Erro ao apagar mota.");
  }
};
async function confirmSendToMaintenance() {
  if (!selectedMotoForMaintenance || !maintenanceReason) return;

  try {
    await apiClient.put(`/api/Vehicle/${selectedMotoForMaintenance.id}`, {
      ...selectedMotoForMaintenance,
      status: "Manutenção", 
      ownerID: null
    });

    await apiClient.post(`/api/Vehicle/maintenance`, {
      motorcycleid: selectedMotoForMaintenance.id,
      description: maintenanceReason,
      date: new Date().toISOString(),
      resolved: false
    });

    setDbMotorcycles((prev) =>
      prev.map((m) =>
        m.id === selectedMotoForMaintenance.id
          ? { ...m, status: "Manutenção", ownerID: null }
          : m
      )
    );

    setSelectedMotoForMaintenance(null);
    setMaintenanceReason("");
  } catch (error) {
    console.error(error);
    alert("Erro ao enviar para manutenção");
  }
}

return (
  
 <div className="flex flex-col h-full bg-background dark:bg-transparent p-6">

    {/* HEADER */}
    <div className="flex justify-between items-center mb-6">
      <h1 className="text-2xl font-bold">Motas</h1>

      <button
        onClick={() => setShowAddModal(true)}
        className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded-lg"
      >
        <Plus size={18} />
        Adicionar Mota
      </button>
    </div>

    {/* LISTA */}
    <div className="flex-1 space-y-4 overflow-y-auto">
      {loading && <p>A carregar...</p>}

      {!loading && dbMotorcycles.length === 0 && (
        <p>Nenhuma mota encontrada.</p>
      )}

      {dbMotorcycles.map((moto) => {
        const active = getActiveAssignment(moto.id);
        const driverName = active
          ? dbDrivers.find((d) => d.id === active.driverid)?.name
          : null;

        return (
          <div
            key={moto.id}
            className="relative bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border"
          >
            {/*  MENU ICON */}
            <div className="absolute top-3 right-3">
              <button
  onClick={() => setSelectedMotoMenu(moto)}
  className="p-1 rounded hover:bg-gray-100 dark:bg-gray-700"
>
  ⚙️
</button>


            
              
            </div>

            {/* INFO */}
            <h3 className="text-lg font-semibold">{moto.name}</h3>
            <p>{moto.brand} {moto.model}</p>

            <p className="text-sm text-gray-500 dark:text-gray-400">
              Matrícula: {moto.vid}
            </p>

            {driverName && (
              <p className="text-blue-600 text-sm font-medium mt-1">
                Atribuída a {driverName}
              </p>
            )}

            {/* STATUS + ATRIBUIR */}
            <div className="flex justify-between items-center mt-4">
              <span className={`font-semibold ${getStatusColor(moto.status)}`}>
                {getStatusLabel(moto.status)}
              </span>

              {moto.status === "Manutenção" ? (
                <span className="px-3 py-1 bg-gray-200 text-gray-600 dark:text-gray-300 rounded text-sm">
                  Indisponível
                </span>
              ) : active ? (
                <button
                  className="px-4 py-2 bg-orange-500 text-white rounded-lg"
                  onClick={() => unassignMotorcycle(moto.id)}
                >
                  Desatribuir
                </button>
              ) : (
                <button
                  className="px-4 py-2 bg-black text-white rounded-lg"
                  onClick={() => openAssignModal(moto)}
                >
                  Atribuir Condutor
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>

{selectedMotoForEdit && (
  <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
    <div className="bg-white dark:bg-gray-800 rounded-xl w-full max-w-md p-6 space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="font-semibold text-lg">Editar Mota</h3>
        <X
          className="cursor-pointer"
          onClick={() => setSelectedMotoForEdit(null)}
        />
      </div>

      <input
        className="w-full border p-2 rounded"
        value={selectedMotoForEdit.name || ""}
        onChange={(e) =>
          setSelectedMotoForEdit({
            ...selectedMotoForEdit,
            name: e.target.value,
          })
        }
        placeholder="Nome"
      />

      <input
        className="w-full border p-2 rounded"
        value={selectedMotoForEdit.marca || ""}
        onChange={(e) =>
          setSelectedMotoForEdit({
            ...selectedMotoForEdit,
            marca: e.target.value,
          })
        }
        placeholder="Marca"
      />

      <input
        className="w-full border p-2 rounded"
        value={selectedMotoForEdit.modelo || ""}
        onChange={(e) =>
          setSelectedMotoForEdit({
            ...selectedMotoForEdit,
            modelo: e.target.value,
          })
        }
        placeholder="Modelo"
      />

      <input
        className="w-full border p-2 rounded"
        value={selectedMotoForEdit.matricula || ""}
        onChange={(e) =>
          setSelectedMotoForEdit({
            ...selectedMotoForEdit,
            matricula: e.target.value,
          })
        }
        placeholder="Matrícula"
      />

      <input
        type="number"
        className="w-full border p-2 rounded"
        value={selectedMotoForEdit.battery_capacity ?? ""}
        onChange={(e) =>
          setSelectedMotoForEdit({
            ...selectedMotoForEdit,
            battery_capacity: e.target.value
              ? Number(e.target.value)
              : null,
          })
        }
        placeholder="Capacidade bateria"
      />

      <input
        type="number"
        className="w-full border p-2 rounded"
        value={selectedMotoForEdit.cargo_capacity ?? ""}
        onChange={(e) =>
          setSelectedMotoForEdit({
            ...selectedMotoForEdit,
            cargo_capacity: e.target.value
              ? Number(e.target.value)
              : null,
          })
        }
        placeholder="Capacidade carga"
      />

      {isAdmin && (
        <select
          className="w-full border p-2 rounded"
          value={selectedMotoForEdit.company_id || selectedMotoForEdit.companyID || ""}
          onChange={(e) =>
            setSelectedMotoForEdit({
              ...selectedMotoForEdit,
              company_id: e.target.value ? Number(e.target.value) : null,
              companyID: e.target.value ? Number(e.target.value) : null,
            })
          }
        >
          <option value="">Selecionar empresa</option>
          {companies.map((company) => (
            <option key={company.id} value={company.id}>
              {company.name}
            </option>
          ))}
        </select>
      )}
      <div className="flex gap-3 pt-2">
        <button
          className="flex-1 bg-gray-200 py-2 rounded"
          onClick={() => setSelectedMotoForEdit(null)}
        >
          Cancelar
        </button>

        <button
          className="flex-1 bg-black text-white py-2 rounded"
          onClick={updateMotorcycle}
        >
          Guardar
        </button>
      </div>
    </div>
  </div>
)}

{/* MODAL MENU MOTA */}
{selectedMotoMenu && (
  <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
    <div className="bg-white dark:bg-gray-800 rounded-xl w-full max-w-sm p-5 space-y-3">

      <h3 className="font-semibold text-lg">
        {selectedMotoMenu.name}
      </h3>
<button
        className="w-full border p-3 rounded hover:bg-orange-50"
        onClick={() => {
          setSelectedMotoForMaintenance(selectedMotoMenu);
          setSelectedMotoMenu(null);
        }}
      >
        Enviar para manutenção
      </button>
      <button
        className="w-full border p-3 rounded hover:bg-gray-100 dark:bg-gray-700"
        onClick={() => {
          setSelectedMotoForEdit({
            ...selectedMotoMenu,
            marca: selectedMotoMenu.brand,
            modelo: selectedMotoMenu.model,
            matricula: selectedMotoMenu.vid,
            battery_capacity: selectedMotoMenu.batteryCapacity,
            cargo_capacity: selectedMotoMenu.cargoCapacity,
            company_id: selectedMotoMenu.companyID,
          });
          setSelectedMotoMenu(null);
        }}
      >
        Editar
      </button>

      <button
        className="w-full border p-3 rounded text-red-600 hover:bg-red-50"
        onClick={() => {
          deleteMotorcycle(selectedMotoMenu);
          setSelectedMotoMenu(null);
        }}
      >
        Apagar
      </button>

      

      <button
        className="w-full bg-gray-200 p-3 rounded"
        onClick={() => setSelectedMotoMenu(null)}
      >
        Cancelar
      </button>
    </div>
  </div>
)}

    {/* MODAL MANUTENÇÃO */}
    {selectedMotoForMaintenance && (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
        <div className="bg-white dark:bg-gray-800 rounded-xl w-full max-w-md">
          
          <div className="flex justify-between p-4 border-b">
            <h3 className="font-semibold">Enviar para Manutenção</h3>
            <X
              className="cursor-pointer"
              onClick={() => setSelectedMotoForMaintenance(null)}
            />
          </div>

          <div className="p-6">
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle className="text-orange-500" size={20} />
                <span className="text-sm text-gray-600 dark:text-gray-300">
                  Está a enviar para manutenção:
                </span>
              </div>

              <div className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg">
                <h4 className="font-medium">
                  {selectedMotoForMaintenance.name}
                </h4>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Matrícula: {selectedMotoForMaintenance.matricula}
                </p>
              </div>
            </div>

            <textarea
              placeholder="Descreva o motivo..."
              className="w-full border rounded-lg p-3 h-28"
              value={maintenanceReason}
              onChange={(e) => setMaintenanceReason(e.target.value)}
            />

            <div className="flex gap-3 mt-6">
              <button
                className="flex-1 bg-gray-200 py-2 rounded-lg"
                onClick={() => setSelectedMotoForMaintenance(null)}
              >
                Cancelar
              </button>

              <button
                className="flex-1 bg-[#333] text-white py-2 rounded-lg disabled:opacity-50"
                disabled={!maintenanceReason}
                onClick={confirmSendToMaintenance}
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      </div>
    )}
{/* MODAL ADICIONAR MOTA */}
{showAddModal && (
  <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
    <div className="bg-white dark:bg-gray-800 rounded-xl w-full max-w-md p-6 space-y-4">

      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Adicionar Mota</h3>

        <X
          className="cursor-pointer"
          onClick={() => setShowAddModal(false)}
        />
      </div>

      <input
        className="w-full border p-2 rounded"
        placeholder="Nome *"
        value={newVehicle.name}
        onChange={(e) =>
          setNewVehicle({ ...newVehicle, name: e.target.value })
        }
      />

      <input
        className="w-full border p-2 rounded"
        placeholder="Marca *"
        value={newVehicle.marca}
        onChange={(e) =>
          setNewVehicle({ ...newVehicle, marca: e.target.value })
        }
      />

      <input
        className="w-full border p-2 rounded"
        placeholder="Modelo *"
        value={newVehicle.modelo}
        onChange={(e) =>
          setNewVehicle({ ...newVehicle, modelo: e.target.value })
        }
      />

      <input
        className="w-full border p-2 rounded"
        placeholder="Matrícula *"
        value={newVehicle.matricula}
        onChange={(e) =>
          setNewVehicle({ ...newVehicle, matricula: e.target.value })
        }
      />

      <input
        type="number"
        className="w-full border p-2 rounded"
        placeholder="Capacidade bateria"
        value={newVehicle.battery_capacity ?? ""}
        onChange={(e) =>
          setNewVehicle({
            ...newVehicle,
            battery_capacity: e.target.value
              ? Number(e.target.value)
              : null,
          })
        }
      />

      <input
        type="number"
        className="w-full border p-2 rounded"
        placeholder="Capacidade carga"
        value={newVehicle.cargo_capacity ?? ""}
        onChange={(e) =>
          setNewVehicle({
            ...newVehicle,
            cargo_capacity: e.target.value
              ? Number(e.target.value)
              : null,
          })
        }
      />

      {isAdmin && (
        <select
          className="w-full border p-2 rounded"
          value={newVehicle.company_id || ""}
          onChange={(e) =>
            setNewVehicle({
              ...newVehicle,
              company_id: e.target.value ? Number(e.target.value) : null,
            })
          }
        >
          <option value="">Selecionar empresa</option>
          {companies.map((company) => (
            <option key={company.id} value={company.id}>
              {company.name}
            </option>
          ))}
        </select>
      )}
      <div className="flex gap-3 pt-2">
        <button
          className="flex-1 bg-gray-200 py-2 rounded"
          onClick={() => setShowAddModal(false)}
        >
          Cancelar
        </button>

        <button
          className="flex-1 bg-black text-white py-2 rounded"
          onClick={addMotorcycle}
        >
          Guardar
        </button>
      </div>
    </div>
  </div>
)}
    {/* MODAL ATRIBUIR CONDUTOR */}
{showAssignModal && selectedMotoForAssignment && (
  <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
    <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-md p-6">
      <h3 className="font-semibold mb-4">
        Atribuir "{selectedMotoForAssignment.name}"
      </h3>

      {!selectedMotoForAssignment.companyID && !selectedMotoForAssignment.company_id ? (
        <p className="text-center text-red-600">
          A mota precisa de estar associada a uma empresa antes de atribuir um condutor.
        </p>
      ) : availableDrivers.length === 0 ? (
        <p className="text-center text-gray-600 dark:text-gray-300">
          Nenhum condutor disponível nesta empresa
        </p>
      ) : (
        <div className="space-y-3">
          {availableDrivers.map((driver) => (
            <button
              key={driver.id}
              className="w-full p-3 border rounded-lg hover:bg-gray-100 dark:bg-gray-700 text-left"
              onClick={() =>
                assignMotorcycle(selectedMotoForAssignment, driver)
              }
            >
              <div className="font-semibold">{driver.name}</div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                {driver.license}
              </div>
            </button>
          ))}
        </div>
      )}

      <button
        className="w-full mt-6 bg-gray-200 py-2 rounded"
        onClick={() => {
          setShowAssignModal(false);
          setSelectedMotoForAssignment(null);
        }}
      >
        Cancelar
      </button>
    </div>
  </div>
)}

  </div>
);
};
export default MotorcyclesPage;
