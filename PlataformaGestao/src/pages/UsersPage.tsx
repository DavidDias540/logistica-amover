import React, { useEffect, useState } from "react";
import { apiClient } from "../api/client";
import { Search, Trash2, XCircle, CheckCircle, Plus } from "lucide-react";

const UsersPage: React.FC = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [selectedCompanyFilter, setSelectedCompanyFilter] = useState<number | "">("");
  const [loading, setLoading] = useState(true);

  const [showAddModal, setShowAddModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [createdPassword, setCreatedPassword] = useState<string | null>(null);
  const [newUser, setNewUser] = useState({
    firstName: "",
    lastName: "",
    email: "",
    nif: "",
    company_id: null as number | null,
  });
  const [companies, setCompanies] = useState<any[]>([]);

  const loadCompanies = async () => {
    try {
      const { data } = await apiClient.get("/api/Company");
      setCompanies(data || []);
    } catch (error) {
      console.error(error);
    }
  };

  
  const loadUsers = async () => {
    setLoading(true);

    try {
      const { data } = await apiClient.get("/api/User");
      const managers = (data || []).filter((u: any) => u.role === "manager" || u.Role === "manager" || u.role === undefined); 
      setUsers(managers);
    } catch (error) {
      console.error(error);
    }

    setLoading(false);
  };

  useEffect(() => {
    loadUsers();
    loadCompanies();
  }, []);

 
  const createUser = async () => {
    const { firstName, lastName, email, nif, company_id } = newUser;
    const name = `${firstName} ${lastName}`.trim();

    if (!firstName || !lastName || !email) {
      alert("Preenche o primeiro nome, último nome e email");
      return;
    }

    if (!company_id) {
      alert("Seleciona uma empresa");
      return;
    }

    try {
      const { data } = await apiClient.post("/api/User", {
        name,
        email,
        role: "manager",
        nif,
        is_active: true,
        companyID: company_id,
      });

      setShowAddModal(false);
      setNewUser({ firstName: "", lastName: "", email: "", nif: "", company_id: null });
      setCreatedPassword(data?.temporaryPassword || data?.TemporaryPassword || null);
      setShowPasswordModal(true);
      loadUsers();
    } catch (error: any) {
      console.error(error);
      const message = error?.response?.data || error?.message || "Erro ao criar conta!";
      alert(typeof message === "string" ? message : "Erro ao criar conta!");
    }
  };

 
  const toggleActive = async (user: any) => {
    try {
      await apiClient.put(`/api/User/${user.id}`, {
        ...user,
        is_active: !user.is_active
      });
      loadUsers();
    } catch (error) {
      console.error(error);
    }
  };

 
  const deleteUser = async (user: any) => {
    if (!confirm("Tem a certeza que pretende eliminar este gestor?")) return;

    try {
      await apiClient.delete(`/api/User/${user.id}`);
      loadUsers();
    } catch (error) {
      console.error(error);
    }
  };

  const filteredUsers = users.filter((u) => {
    const matchesSearch = u.name.toLowerCase().includes(search.toLowerCase());
    const matchesCompany = selectedCompanyFilter === "" || (u.companyID || u.company_id) === selectedCompanyFilter;
    return matchesSearch && matchesCompany;
  });

  const getCompanyName = (companyId: number | null | undefined) => {
    if (!companyId) return "Sem empresa";
    const company = companies.find((c) => c.id === companyId);
    return company ? company.name : `Empresa #${companyId}`;
  };

 
  return (
    <div className="p-6 space-y-4">

      {/* TOPO */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <div className="flex items-center gap-2 w-full md:max-w-md">
          <Search size={18} className="text-gray-500 dark:text-gray-400 flex-shrink-0" />
          <input
            className="border rounded px-3 py-2 w-full"
            placeholder="Pesquisar gestor..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          <select
            className="border rounded px-3 py-2 w-full sm:w-auto"
            value={selectedCompanyFilter}
            onChange={(e) => setSelectedCompanyFilter(e.target.value === "" ? "" : Number(e.target.value))}
          >
            <option value="">Todas as empresas</option>
            {companies.map((company) => (
              <option key={company.id} value={company.id}>
                {company.name}
              </option>
            ))}
          </select>

          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center justify-center gap-2 bg-black text-white px-4 py-2 rounded w-full sm:w-auto"
          >
            <Plus size={18} />
            Criar Gestor
          </button>
        </div>
      </div>

      
      {loading && <p>A carregar...</p>}

      {!loading && filteredUsers.length === 0 && (
        <p>Nenhum gestor encontrado.</p>
      )}

      <div className="space-y-3">
        {filteredUsers.map((u) => (
          <div
            key={u.id}
            className="bg-white dark:bg-gray-800 border rounded-lg p-4 flex flex-col sm:flex-row sm:justify-between gap-3"
          >
            <div className="min-w-0">
              <p className="font-medium truncate">{u.name}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{u.email}</p>
              <p className="text-sm text-blue-600 font-medium">
                {getCompanyName(u.companyID || u.company_id)}
              </p>
              {!u.is_active && (
                <p className="text-xs text-red-600 font-semibold">
                  Conta desativada
                </p>
              )}
            </div>

            <div className="flex gap-3 sm:items-start">
              <button
                title={u.is_active ? "Desativar" : "Reativar"}
                className="p-2 text-blue-600 hover:text-blue-800"
                onClick={() => toggleActive(u)}
              >
                {u.is_active ? <XCircle size={22} /> : <CheckCircle size={22} />}
              </button>

              <button
                title="Eliminar"
                className="p-2 text-red-600 hover:text-red-800"
                onClick={() => deleteUser(u)}
              >
                <Trash2 size={22} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
          <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-md p-6 space-y-4">
            <h3 className="font-semibold text-lg">Criar Novo Gestor</h3>

            <div className="flex gap-2">
              <input
                placeholder="Primeiro nome"
                className="w-full border p-2 rounded"
                value={newUser.firstName}
                onChange={(e) =>
                  setNewUser({ ...newUser, firstName: e.target.value })
                }
              />
              <input
                placeholder="Último nome"
                className="w-full border p-2 rounded"
                value={newUser.lastName}
                onChange={(e) =>
                  setNewUser({ ...newUser, lastName: e.target.value })
                }
              />
            </div>

            <input
              placeholder="Email"
              className="w-full border p-2 rounded"
              value={newUser.email}
              onChange={(e) =>
                setNewUser({ ...newUser, email: e.target.value })
              }
            />

            <input
              placeholder="NIF"
              className="w-full border p-2 rounded"
              value={newUser.nif}
              onChange={(e) =>
                setNewUser({ ...newUser, nif: e.target.value })
              }
            />

            <div>
              <label className="block text-sm text-gray-600 dark:text-gray-300 mb-1">Empresa atribuída *</label>
              <select
                className="w-full border p-2 rounded"
                value={newUser.company_id || ""}
                onChange={(e) =>
                  setNewUser({ ...newUser, company_id: e.target.value ? Number(e.target.value) : null })
                }
              >
                <option value="">Selecionar empresa</option>
                {companies.map((company) => (
                  <option key={company.id} value={company.id}>
                    {company.name}
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                O gestor apenas conseguirá ver e gerir condutores e tarefas desta empresa.
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={createUser}
                className="flex-1 bg-black text-white py-2 rounded"
              >
                Guardar
              </button>
              <button
                onClick={() => setShowAddModal(false)}
                className="flex-1 bg-gray-200 py-2 rounded"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {showPasswordModal && createdPassword && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
          <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-md p-6 space-y-4">
            <h3 className="font-semibold text-lg">Gestor criado</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Guarda esta password temporária. O gestor terá de a usar para iniciar sessão pela primeira vez.
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

export default UsersPage;
