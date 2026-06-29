import React, { useEffect, useState } from "react";
import { apiClient } from "../api/client";
import { Plus, X, Pencil, Trash } from "lucide-react";

const CompaniesPage: React.FC = () => {
  const [companies, setCompanies] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [selectedCompany, setSelectedCompany] = useState<any>(null);

  const [showCompanyModal, setShowCompanyModal] = useState(false);
  const [showServiceModal, setShowServiceModal] = useState(false);
  const [isEditingCompany, setIsEditingCompany] = useState(false);
  const [isEditingService, setIsEditingService] = useState(false);

  const [companyForm, setCompanyForm] = useState({ id: null, name: "", description: "" });
  const [serviceForm, setServiceForm] = useState({ id: null, category: "", description: "" });


  useEffect(() => {
    loadCompanies();
  }, []);

  const loadCompanies = async () => {
    try {
      const { data } = await apiClient.get("/api/Company");
      // Sort manually since API might not
      const sorted = (data || []).sort((a: any, b: any) => a.name?.localeCompare(b.name));
      setCompanies(sorted);
    } catch (error) {
      console.error(error);
    }
  };

  const loadServices = async (companyId: number) => {
    try {
      const { data } = await apiClient.get(`/api/Service`);
      // Filter manually if the API doesn't support query params, but assume we filter locally if needed
      const filtered = (data || []).filter((s: any) => s.company_id === companyId || s.CompanyId === companyId || s.companyID === companyId || s.companyId === companyId);
      filtered.sort((a: any, b: any) => a.category?.localeCompare(b.category));
      setServices(filtered);
    } catch (error) {
      console.error(error);
    }
  };

  const selectCompany = (company: any) => {
    setSelectedCompany(company);
    loadServices(company.id);
  };


 const saveCompany = async () => {
  if (!companyForm.name) {
    alert("Nome da empresa é obrigatório");
    return;
  }

  if (isEditingCompany) {
    try {
      await apiClient.put(`/api/Company/${companyForm.id}`, {
        name: companyForm.name,
        description: companyForm.description,
      });

      setCompanies((prev) =>
        prev.map((c) => (c.id === companyForm.id ? companyForm : c))
      );
    } catch (error) {
      console.error(error);
      alert("Erro ao editar empresa");
    }
  } else {
    try {
      const { data } = await apiClient.post("/api/Company", {
        name: companyForm.name,
        description: companyForm.description
      });

      setCompanies((prev) => [...prev, data]);
    } catch (error) {
      console.error(error);
      alert("Erro ao criar empresa");
    }
  }

  closeCompanyModal();
};



  const deleteCompany = async (id: number) => {
    if (!confirm("Eliminar empresa e todos os serviços associados?")) return;

    try {
      await apiClient.delete(`/api/Company/${id}`);
      setCompanies((prev) => prev.filter((c) => c.id !== id));
      setServices([]);
      setSelectedCompany(null);
    } catch (error) {
      console.error(error);
      alert("Erro ao eliminar empresa");
    }
  };

  const openEditCompany = (company: any) => {
    setCompanyForm(company);
    setIsEditingCompany(true);
    setShowCompanyModal(true);
  };

  const closeCompanyModal = () => {
    setCompanyForm({ id: null, name: "", description: "" });
    setIsEditingCompany(false);
    setShowCompanyModal(false);
  };

  
  const saveService = async () => {
  if (!serviceForm.category) {
    alert("Categoria é obrigatória");
    return;
  }

  if (isEditingService) {
    try {
      await apiClient.put(`/api/Service/${serviceForm.id}`, {
        category: serviceForm.category,
        description: serviceForm.description,
      });

      setServices((prev) =>
        prev.map((s) => (s.id === serviceForm.id ? serviceForm : s))
      );
    } catch (error) {
      console.error(error);
      alert("Erro ao editar serviço");
    }
  } else {
    try {
      const { data } = await apiClient.post("/api/Service", {
        category: serviceForm.category,
        description: serviceForm.description,
        companyID: selectedCompany.id,
      });

      setServices((prev) => [...prev, data]);
    } catch (error) {
      console.error(error);
      alert("Erro ao criar serviço");
    }
  }

  closeServiceModal();
};


  const deleteService = async (id: number) => {
    if (!confirm("Eliminar serviço?")) return;

    try {
      await apiClient.delete(`/api/Service/${id}`);
      setServices((prev) => prev.filter((s) => s.id !== id));
    } catch (error) {
      console.error(error);
      alert("Erro ao eliminar serviço");
    }
  };

  const openEditService = (service: any) => {
    setServiceForm(service);
    setIsEditingService(true);
    setShowServiceModal(true);
  };

  const closeServiceModal = () => {
    setServiceForm({ id: null, category: "", description: "" });
    setIsEditingService(false);
    setShowServiceModal(false);
  };


  return (
    <div className="p-6 bg-gray-100 dark:bg-gray-700 h-full">
      <h2 className="text-xl font-semibold mb-4">Gestão de Empresas & Serviços</h2>

      <div className="grid grid-cols-2 gap-6">
        {/* ================= COMPANIES ================= */}
        <div className="bg-white dark:bg-gray-800 p-4 rounded shadow">
          <div className="flex justify-between mb-3">
            <h3 className="font-semibold">Empresas</h3>
            <button
              onClick={() => setShowCompanyModal(true)}
              className="bg-black text-white px-3 py-1 rounded flex items-center gap-2"
            >
              <Plus size={16} /> Nova
            </button>
          </div>

          {companies.map((company) => (
            <div
              key={company.id}
              className={`p-3 border rounded mb-2 cursor-pointer ${
                selectedCompany?.id === company.id ? "bg-gray-100 dark:bg-gray-700" : ""
              }`}
              onClick={() => selectCompany(company)}
            >
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-medium">{company.name}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{company.description}</p>
                </div>
                <div className="flex gap-2">
                  <Pencil size={16} onClick={() => openEditCompany(company)} />
                  <Trash size={16} onClick={() => deleteCompany(company.id)} />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* ================= SERVICES ================= */}
        <div className="bg-white dark:bg-gray-800 p-4 rounded shadow">
          <div className="flex justify-between mb-3">
            <h3 className="font-semibold">
              Serviços {selectedCompany && `– ${selectedCompany.name}`}
            </h3>
            <button
              disabled={!selectedCompany}
              onClick={() => setShowServiceModal(true)}
              className="bg-black text-white px-3 py-1 rounded flex items-center gap-2 disabled:opacity-50"
            >
              <Plus size={16} /> Novo
            </button>
          </div>

          {!selectedCompany ? (
            <p className="text-gray-500 dark:text-gray-400">Seleciona uma empresa</p>
          ) : (
            services.map((service) => (
              <div key={service.id} className="p-3 border rounded mb-2">
                <div className="flex justify-between">
                  <div>
                    <p className="font-medium">{service.category}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {service.description}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Pencil size={16} onClick={() => openEditService(service)} />
                    <Trash size={16} onClick={() => deleteService(service.id)} />
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* ================= MODALS ================= */}
      {showCompanyModal && (
        <Modal onClose={closeCompanyModal}>
          <h3 className="font-semibold mb-3">
            {isEditingCompany ? "Editar Empresa" : "Nova Empresa"}
          </h3>

          <input
            className="w-full border p-2 mb-2 rounded"
            placeholder="Nome"
            value={companyForm.name}
            onChange={(e) =>
              setCompanyForm({ ...companyForm, name: e.target.value })
            }
          />

          <input
            className="w-full border p-2 mb-4 rounded"
            placeholder="Descrição"
            value={companyForm.description}
            onChange={(e) =>
              setCompanyForm({ ...companyForm, description: e.target.value })
            }
          />

          <button
            className="w-full bg-black text-white py-2 rounded"
            onClick={saveCompany}
          >
            Guardar
          </button>
        </Modal>
      )}

      {showServiceModal && (
        <Modal onClose={closeServiceModal}>
          <h3 className="font-semibold mb-3">
            {isEditingService ? "Editar Serviço" : "Novo Serviço"}
          </h3>

          <input
            className="w-full border p-2 mb-2 rounded"
            placeholder="Categoria"
            value={serviceForm.category}
            onChange={(e) =>
              setServiceForm({ ...serviceForm, category: e.target.value })
            }
          />

          <input
            className="w-full border p-2 mb-4 rounded"
            placeholder="Descrição"
            value={serviceForm.description}
            onChange={(e) =>
              setServiceForm({ ...serviceForm, description: e.target.value })
            }
          />

          <button
            className="w-full bg-black text-white py-2 rounded"
            onClick={saveService}
          >
            Guardar
          </button>
        </Modal>
      )}
    </div>
  );
};

export default CompaniesPage;

const Modal = ({ children, onClose }: any) => (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
      <div className="flex justify-end mb-2">
        <X className="cursor-pointer" onClick={onClose} />
      </div>
      {children}
    </div>
  </div>
);
