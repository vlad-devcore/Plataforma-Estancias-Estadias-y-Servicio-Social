export const roleRenderer = (role) => {
    const roleMappings = {
      estudiante: 'Estudiante',
      administrador: 'Administrador',
      asesor_academico: 'Asesor Académico',
      asesor_empresarial: 'Asesor Empresarial'
    };
    return roleMappings[role] || role;
  };
  
  export const statusRenderer = (status) => {
    return status ? (
      <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-sm">Activo</span>
    ) : (
      <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-sm">Inactivo</span>
    );
  };
  
  export const dateRenderer = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('es-MX', options);
  };
  
  export const badgeRenderer = (value, color = 'blue') => {
    const colors = {
      blue: 'bg-blue-100 text-blue-800',
      green: 'bg-green-100 text-green-800',
      red: 'bg-red-100 text-red-800',
      yellow: 'bg-yellow-100 text-yellow-800'
    };
    return (
      <span className={`px-2 py-1 ${colors[color]} rounded-full text-sm`}>
        {value}
      </span>
    );
  };
  
  // Exportar todas las funciones juntas
  export default {
    roleRenderer,
    statusRenderer,
    dateRenderer,
    badgeRenderer
  };