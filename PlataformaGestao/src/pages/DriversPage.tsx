import React, { useState, useEffect } from "react";
import { User, Plus, X, Search } from "lucide-react";
import { apiClient } from "../api/client";
import { useMotorcycleStore } from "../types/motorcycle";
import { useAuth } from "../context/AuthContext";
type NewDriver = {
  name: string;
  license: string;
  phone: string;
  email: string;
  status: string;
  company_id: number | null;
  photoUrl?: string;
};

const DriversPage: React.FC = () => {
  const { role, companyId } = useAuth();
  const isManager = role === "manager";
  const isAdmin = role === "admin";
  const [drivers, setDrivers] = useState<any[]>([]);
  const [companies, setCompanies] = useState<any[]>([]);
  const { motorcycles } = useMotorcycleStore();
  const [selectedDriver, setSelectedDriver] = useState<number | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingDriverId, setEditingDriverId] = useState<number | null>(null);
// driverTasks removed
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [createdPassword, setCreatedPassword] = useState<string | null>(null);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [resetDriverId, setResetDriverId] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<"ativos" | "inativos">("ativos");
  const [searchQuery, setSearchQuery] = useState("");

  const [newDriver, setNewDriver] = useState<NewDriver>({
  name: "",
  license: "",
  phone: "",
  email: "",
  status: "active",
  company_id: null,
  photoUrl: "",
});

const fileInputRef = React.useRef<HTMLInputElement>(null);

const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0];
  if (file) {
    const reader = new FileReader();
    reader.onloadend = () => {
      setNewDriver(prev => ({
        ...prev,
        photoUrl: reader.result as string
      }));
    };
    reader.readAsDataURL(file);
  }
};




  const loadCompanies = async () => {
    try {
      const { data } = await apiClient.get("/api/Company");
      setCompanies(data.$values || data || []);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    async function loadData() {
      try {
        const { data: driversData } = await apiClient.get("/api/User?role=driver"); // Or similar backend endpoint

        let allUsers = driversData.$values || driversData || [];
        let onlyDrivers = allUsers.filter((u: any) => {
          const userRole = (u.role || u.Role || "").toLowerCase();
          return userRole === "driver" || userRole === "motorista";
        });

        if (isManager && companyId) {
          onlyDrivers = onlyDrivers.filter((u: any) => u.companyID === companyId || u.companyId === companyId);
        }
        
        setDrivers(onlyDrivers);
      } catch (error) {
        console.error(error);
      }
    }

    loadData();
    loadCompanies();
  }, [isManager, companyId]);


 
  const handleAddDriver = async () => {
    if (
      !newDriver.name ||
      !newDriver.license ||
      !newDriver.phone ||
      !newDriver.email ||
      !newDriver.company_id
    ) {
      alert("Preenche todos os campos obrigatórios!");
      return;
    }

    if (editingDriverId) {
      try {
        await apiClient.put(`/api/User/${editingDriverId}`, {
          name: newDriver.name,
          driverLicense: newDriver.license,
          phone: newDriver.phone,
          email: newDriver.email,
          status: newDriver.status,
          companyID: newDriver.company_id,
          photoUrl: newDriver.photoUrl,
        });

        setDrivers((prev) =>
          prev.map((driver) =>
            driver.id === editingDriverId
              ? { ...driver, ...newDriver, driverLicense: newDriver.license, companyID: newDriver.company_id }
              : driver
          )
        );
      } catch (error) {
        console.error(error);
        alert("Erro ao atualizar condutor");
      }
    } else {
      try {
        const { data } = await apiClient.post("/api/User", {
          name: newDriver.name,
          driverLicense: newDriver.license,
          phone: newDriver.phone,
          email: newDriver.email,
          status: "active",
          role: "driver", // explicitly tell backend it's a driver
          companyID: newDriver.company_id,
          photoUrl: newDriver.photoUrl,
        });

        // The new backend endpoint returns { User: User } or camelCase
        const createdUser = data.user || data.User || data; 
        setDrivers((prev) => [...prev, createdUser]);

        const tempPassword = data?.temporaryPassword || data?.TemporaryPassword || null;
        if (tempPassword) {
          setCreatedPassword(tempPassword);
          setShowPasswordModal(true);
        } else {
          alert("Condutor adicionado com sucesso!");
        }

      } catch (error) {
        console.error(error);
        alert("Erro ao adicionar condutor");
      }
    }

    setNewDriver({
      name: "",
      license: "",
      phone: "",
      email: "",
      status: "active",
      company_id: null,
      photoUrl: "",
    });

    setEditingDriverId(null);
    setShowAddModal(false);
  };
  const handleDeleteDriver = async (id: number) => {
    if (!confirm("Tens a certeza que queres eliminar este condutor?")) return;

    try {
      await apiClient.delete(`/api/User/${id}`);
      setDrivers((prev) => prev.filter((d) => d.id !== id));
    } catch (error) {
      alert("Erro ao eliminar condutor");
    }
  };

  const handleResetPassword = (id: number) => {
    setResetDriverId(id);
    setShowResetConfirm(true);
  };

  const confirmResetPassword = async () => {
    if (!resetDriverId) return;

    try {
      const { data } = await apiClient.put(`/api/User/${resetDriverId}/reset-password`);
      const tempPassword = data?.temporaryPassword || data?.TemporaryPassword || null;
      if (tempPassword) {
        setCreatedPassword(tempPassword);
        setShowPasswordModal(true);
      } else {
        alert("Password resetada com sucesso.");
      }
    } catch (error) {
      alert("Erro ao resetar password");
    } finally {
      setShowResetConfirm(false);
      setResetDriverId(null);
    }
  };

  const toggleStatus = async (driver: any) => {
    const currentIsActive = driver.is_active !== false;
    const newIsActive = !currentIsActive;

    try {
      await apiClient.put(`/api/User/${driver.id}`, {
        name: driver.name,
        driverLicense: driver.driverLicense,
        phone: driver.phone,
        email: driver.email,
        isActive: newIsActive,
        role: "driver",
        companyID: driver.companyID,
        photoUrl: driver.photoUrl,
        password: driver.password || ""
      });
      
      setDrivers((prev) =>
        prev.map((d) =>
          d.id === driver.id ? { ...d, is_active: newIsActive } : d
        )
      );
    } catch (error) {
      alert("Erro ao alterar estado");
    }
  };

const getCompanyName = (companyId: number | null) => {
  const company = companies.find((c) => c.id === companyId);
  return company ? company.name : "—";
};

const [driverRoutes, setDriverRoutes] = useState<any[]>([]);
const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);

  async function loadDriverRoutes(driverId: number, date: string) {
    try {
      // Encontrar a mota do condutor para passar vehicleId
      const driverMoto = motorcycles.find(m => m.owner?.id === driverId);
      if (!driverMoto) {
        setDriverRoutes([]);
        return;
      }
      
      const { data } = await apiClient.get(`/api/Route?vehicleId=${driverMoto.id}&date=${date}`);
      setDriverRoutes(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error(error);
      setDriverRoutes([]);
    }
  }
  return (
    <div className="flex flex-col h-full bg-[#d6d6d6] p-6">
      {/* TABS E PESQUISA */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6 border-b border-gray-300 dark:border-gray-600 pb-2">
        <div className="flex gap-4 w-full md:w-auto">
          <button 
            className={`px-4 py-2 font-semibold ${activeTab === 'ativos' ? 'text-[#333333] border-b-2 border-[#333333]' : 'text-gray-500 dark:text-gray-400'}`}
            onClick={() => setActiveTab('ativos')}
          >
            Ativos
          </button>
          <button 
            className={`px-4 py-2 font-semibold ${activeTab === 'inativos' ? 'text-[#333333] border-b-2 border-[#333333]' : 'text-gray-500 dark:text-gray-400'}`}
            onClick={() => setActiveTab('inativos')}
          >
            Inativos
          </button>
        </div>
        <div className="w-full md:w-64 relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search size={18} className="text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Pesquisar por nome..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#333333]"
          />
        </div>
      </div>

      {/* LISTA DE CONDUTORES */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
        {drivers.filter(d => {
          const matchesTab = activeTab === 'ativos' ? d.is_active !== false : d.is_active === false;
          const matchesSearch = d.name?.toLowerCase().includes(searchQuery.toLowerCase());
          return matchesTab && matchesSearch;
        }).map((driver) => (
  <div
    key={driver.id}
    className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
onClick={() => {
  const today = new Date().toISOString().split('T')[0];
  setSelectedDriver(driver.id);
  setSelectedDate(today);
  loadDriverRoutes(driver.id, today);
  setShowHistoryModal(true);
}}  >
    <div className="flex items-center gap-4 mb-4">
      {driver.photoUrl ? (
        <img
          src={driver.photoUrl}
          alt={driver.name}
          className="w-16 h-16 rounded-full object-cover"
        />
      ) : (
        <div className="bg-gray-100 dark:bg-gray-700 rounded-full p-4">
          <User size={32} className="text-gray-600 dark:text-gray-300" />
        </div>
      )}

      <div>
        <h3 className="font-semibold text-lg">{driver.name}</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">Licença: {driver.driverLicense}</p>
      </div>
    </div>
    <p className="text-sm text-gray-600 dark:text-gray-300">
  Empresa: {getCompanyName(driver.companyID)}
</p>

    <p className="text-sm text-gray-600 dark:text-gray-300">Email: {driver.email}</p>
    <p className="text-sm text-gray-600 dark:text-gray-300">Telefone: {driver.phone}</p>

    <div className="mt-4 flex items-center justify-between">
      <span
        className={`px-3 py-1 rounded-full text-sm ${
          driver.is_active !== false
            ? "bg-green-100 text-green-800"
            : "bg-red-100 text-red-800"
        }`}
      >
        {driver.is_active !== false ? "Ativo" : "Inativo"}
      </span>

      {/* BOTÕES */}
      <div className="flex gap-3 text-sm">
        {/* EDITAR */}
        <button
          onClick={(e) => {
            e.stopPropagation(); 
            setNewDriver({
              name: driver.name,
              license: driver.driverLicense || "",
              phone: driver.phone || "",
              email: driver.email,
              status: driver.is_active !== false ? "active" : "inactive",
              company_id: driver.companyID,
              photoUrl: driver.photoUrl || "",
            });
            setEditingDriverId(driver.id);
            setShowAddModal(true);
          }}
          className="text-blue-600 hover:underline"
        >
          Editar
        </button>

        {/* ATIVAR/INATIVAR */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleStatus(driver);
          }}
          className={`${
            driver.is_active !== false ? "text-orange-500" : "text-green-500"
          } hover:underline`}
        >
          {driver.is_active !== false ? "Desativar" : "Ativar"}
        </button>

        {/* ELIMINAR */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleDeleteDriver(driver.id);
          }}
          className="text-red-600 hover:underline"
        >
          Eliminar
        </button>

        {/* RESET PASSWORD */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleResetPassword(driver.id);
          }}
          className="text-purple-600 hover:underline"
        >
          Reset Password
        </button>
      </div>
    </div>
  </div>
))}

      </div>

      {/* BOTÃO "ADICIONAR" */}
      <button
  onClick={() => {
    setNewDriver({
      name: "",
      license: "",
      phone: "",
      email: "",
      status: "active",
      company_id: isManager && companyId ? companyId : null,
    });
    setEditingDriverId(null); 
    setShowAddModal(true);
  }}
  className="fixed bottom-6 right-6 bg-[#333333] text-white p-4 rounded-full"
>
  +
</button>


      {/* MODAL ADICIONAR DRIVER */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-md">
            <div className="flex justify-between items-center p-4 border-b">
              <h3 className="text-xl font-semibold">
  {editingDriverId ? "Editar Condutor" : "Adicionar Novo Condutor"}
</h3>

              <button onClick={() => setShowAddModal(false)}>
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm text-gray-600 dark:text-gray-300 mb-1">Nome Completo (Primeiro e Último) *</label>
                <input
                  type="text"
                  value={newDriver.name}
                  onChange={(e) =>
                    setNewDriver({ ...newDriver, name: e.target.value })
                  }
                  className="w-full border p-2 rounded"
                />
              </div>
<div>
  <label className="block text-sm text-gray-600 dark:text-gray-300 mb-1">
    Empresa *
  </label>
  <select
    value={newDriver.company_id || ""}
    onChange={(e) =>
      setNewDriver({
        ...newDriver,
        company_id: e.target.value
          ? Number(e.target.value)
          : null,
      })
    }
    disabled={isManager}
    className="w-full border p-2 rounded disabled:bg-gray-100 dark:bg-gray-700 disabled:text-gray-500 dark:text-gray-400"
  >
    <option value="">Selecionar empresa</option>
    {companies.map((company) => (
      <option key={company.id} value={company.id}>
        {company.name}
      </option>
    ))}
  </select>
</div>

              <div>
                <label className="block text-sm text-gray-600 dark:text-gray-300 mb-1">
                  Licença *
                </label>
                <input
                  type="text"
                  value={newDriver.license}
                  onChange={(e) =>
                    setNewDriver({ ...newDriver, license: e.target.value })
                  }
                  className="w-full border p-2 rounded"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-600 dark:text-gray-300 mb-1">
                  Telefone *
                </label>
                <input
                  type="text"
                  value={newDriver.phone}
                  onChange={(e) =>
                    setNewDriver({ ...newDriver, phone: e.target.value })
                  }
                  className="w-full border p-2 rounded"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-600 dark:text-gray-300 mb-1">
                  Email *
                </label>
                <input
                  type="email"
                  value={newDriver.email}
                  onChange={(e) =>
                    setNewDriver({ ...newDriver, email: e.target.value })
                  }
                  className="w-full border p-2 rounded"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-600 dark:text-gray-300 mb-1">
                  Foto
                </label>
                <div className="flex items-center gap-4">
                  {newDriver.photoUrl && (
                    <img src={newDriver.photoUrl} alt="Preview" className="w-12 h-12 rounded-full object-cover border" />
                  )}
                  <input
                    type="file"
                    accept="image/jpeg, image/png"
                    ref={fileInputRef}
                    onChange={handlePhotoChange}
                    className="w-full text-sm text-gray-500 dark:text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-gray-100 dark:bg-gray-700 file:text-gray-700 dark:text-gray-200 hover:file:bg-gray-200"
                  />
                </div>
              </div>

              <button
                className="w-full mt-4 bg-[#333333] text-white py-2 rounded font-semibold disabled:opacity-50"
                onClick={handleAddDriver}
               disabled={
  !newDriver.name ||
  !newDriver.company_id ||
  !newDriver.license ||
  !newDriver.phone ||
  !newDriver.email
}

              >
                {editingDriverId ? "Guardar Alterações" : "Adicionar"}
              </button>
            </div>
          </div>
        </div>
      )}

      {showHistoryModal && selectedDriver && (
  <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
    <div className="bg-white dark:bg-gray-800 rounded-xl w-full max-w-lg p-6">

      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold text-lg">
          Histórico de Rotas
        </h3>
        <button onClick={() => setShowHistoryModal(false)}>
          <X />
        </button>
      </div>

      <div className="mb-4">
        <label className="block text-sm text-gray-600 dark:text-gray-300 mb-1">
          Selecionar Dia
        </label>
        <input 
          type="date" 
          value={selectedDate}
          onChange={(e) => {
            const newDate = e.target.value;
            setSelectedDate(newDate);
            if (selectedDriver) {
              loadDriverRoutes(selectedDriver, newDate);
            }
          }}
          className="w-full border p-2 rounded"
        />
      </div>

      {driverRoutes.length === 0 ? (
        <p className="text-gray-500 dark:text-gray-400 text-sm mt-4">
          Nenhuma rota encontrada para este motorista neste dia.
        </p>
      ) : (
        <div className="space-y-4 max-h-[50vh] overflow-y-auto mt-4">
          {driverRoutes.map((routeGroup, index) => (
            <div key={routeGroup.id || index} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-gray-50 dark:bg-gray-700/50">
              <div className="flex justify-between items-center mb-3">
                <span className="font-semibold text-gray-700 dark:text-gray-200">Rota {index + 1}</span>
                <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded-full">
                  {routeGroup.routePoints?.length || 0} Paragens
                </span>
              </div>
              
              <div className="space-y-2">
                {routeGroup.routePoints?.map((point: any) => (
                  <div key={point.id} className="bg-white dark:bg-gray-800 border rounded p-3 text-sm">
                    <div className="flex justify-between items-start">
                      <div className="font-medium text-gray-800 dark:text-gray-100">
                        {point.stopOrder}. {point.task?.title || "Tarefa Sem Título"}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                        {point.task?.status}
                      </div>
                    </div>
                    <div className="text-gray-500 dark:text-gray-400 mt-1">
                      {point.task?.street} {point.task?.city ? `· ${point.task.city}` : ''}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  </div>
)}

{showResetConfirm && (
  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
    <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-md p-6 space-y-4">
      <h3 className="font-semibold text-lg">Confirmar reset de password</h3>
      <p className="text-sm text-gray-600 dark:text-gray-300">
        Tens a certeza que queres resetar a password deste condutor? Irá gerar uma password temporária e o condutor terá de a alterar no próximo login.
      </p>
      <div className="flex gap-3">
        <button
          onClick={() => {
            setShowResetConfirm(false);
            setResetDriverId(null);
          }}
          className="w-full bg-gray-200 py-2 rounded"
        >
          Cancelar
        </button>
        <button
          onClick={confirmResetPassword}
          className="w-full bg-black text-white py-2 rounded"
        >
          Confirmar
        </button>
      </div>
    </div>
  </div>
)}

{showPasswordModal && createdPassword && (
  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
    <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-md p-6 space-y-4">
      <h3 className="font-semibold text-lg">Condutor criado</h3>
      <p className="text-sm text-gray-600 dark:text-gray-300">
        Guarda esta password temporária. O condutor terá de a usar para iniciar sessão pela primeira vez.
      </p>
      <div className="bg-gray-100 dark:bg-gray-700 p-3 rounded border flex justify-between items-center">
        <code className="text-sm font-mono break-all">{createdPassword}</code>
        <button
          onClick={() => navigator.clipboard.writeText(createdPassword)}
          className="text-xs bg-black text-white px-2 py-1 rounded"
        >
          Copiar
        </button>
      </div>
      <button
        onClick={() => setShowPasswordModal(false)}
        className="w-full bg-black text-white py-2 rounded"
      >
        Fechar
      </button>
    </div>
  </div>
)}

    </div>
  );
};

export default DriversPage;
