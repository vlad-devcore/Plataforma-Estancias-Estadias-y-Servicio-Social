import React, { useState } from "react";
import { Search } from "react-feather";
import CrudLayout from "../components/management/CrudLayout";
import CrudTable from "../components/management/CrudTable/CrudTable";
import EditEmpresaModal from "../components/empresas/modals/EditEmpresaModal";
import ViewEmpresaModal from "../components/empresas/modals/ViewEmpresaModal";
import ConfirmDeleteModal from "../components/admin/modals/ConfirmDeleteModal";
import UploadCSV from "../components/empresas/UploadCSV";
import useEmpresas from "../components/hooks/useEmpresas";
import Sidebar from "../components_admin/Sidebar";

const CompaniesDirectory = () => {
  const {
    companies,
    loading,
    error,
    updateEmpresa,
    deleteEmpresa,
    handleUpload,
  } = useEmpresas();

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedEmpresa, setSelectedEmpresa] = useState(null);
  const [modalType, setModalType] = useState(null);
  const [empresaToDelete, setEmpresaToDelete] = useState(null);

  const filteredCompanies = companies.filter(
    (company) =>
      company.empresa_nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      company.empresa_rfc.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleModalOpen = (type, empresa = null) => {
    setModalType(type);
    setSelectedEmpresa(empresa);
  };

  const handleModalClose = () => {
    setModalType(null);
    setSelectedEmpresa(null);
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      <div className="w-64 fixed left-0 top-0 h-full bg-white shadow-lg">
        <Sidebar />
      </div>

      <div className="flex-1 ml-64 p-8">
        <CrudLayout title="Directorio de Empresas" icon="briefcase">
          {/* Barra de búsqueda */}
          <div className="mb-6 relative">
            <Search
              className="absolute left-3 top-3.5 text-gray-400"
              size={20}
            />
            <input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-orange-500"
              placeholder="Buscar por nombre o RFC..."
            />
          </div>

          {/* Tabla de empresas */}
          <CrudTable
            data={filteredCompanies}
            columns={[
              {
                key: "empresa_rfc",
                header: "RFC",
                className: "w-32",
              },
              {
                key: "empresa_nombre",
                header: "Nombre",
              },
              {
                key: "empresa_tamano",
                header: "Tamaño",
                render: (value) => <span className="capitalize">{value}</span>,
              },
            ]}
            loading={loading}
            error={error}
            onView={(company) => handleModalOpen("ver", company)}
            onDelete={(company) => handleModalOpen("eliminar", company)}
          />

          {/* Módulo de carga CSV */}
          <div className="mt-12">
            <UploadCSV onUpload={handleUpload} />
          </div>

          {/* Modales */}
          {modalType === "ver" && (
            <ViewEmpresaModal
              empresa={selectedEmpresa}
              onClose={handleModalClose}
            />
          )}

          {modalType === "editar" && (
            <EditEmpresaModal
              empresa={selectedEmpresa}
              onClose={handleModalClose}
              onSave={updateEmpresa}
            />
          )}

          {empresaToDelete && (
            <ConfirmDeleteModal
              itemId={empresaToDelete.id_empresa} // ✅ ID específico para empresas
              itemName={empresaToDelete.empresa_nombre}
              onClose={() => setEmpresaToDelete(null)}
              onConfirm={deleteEmpresa} // ✅ Función específica
            />
          )}
        </CrudLayout>
      </div>
    </div>
  );
};

export default CompaniesDirectory;
