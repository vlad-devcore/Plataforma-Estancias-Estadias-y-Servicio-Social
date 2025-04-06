import axios from 'axios';

export const useCrudOperations = (endpoint) => {
    const deleteItem = async (id) => {
      try {
        await axios.delete(`http://localhost:9999/api/${endpoint}/${id}`);
        return true;
      } catch (error) {
        console.error(`Error eliminando ${endpoint}:`, error);
        throw error;
      }
    };
  
    return { deleteItem };
  };
  
  // Example usage inside a React component or custom hook:
  export const useEmpresaOperations = () => {
    const { deleteItem: deleteEmpresa } = useCrudOperations('empresas');
    return { deleteEmpresa };
  };

  export const useUserOperations = () => {
    const { deleteItem: deleteUser } = useCrudOperations('users');
    return { deleteUser };
  };