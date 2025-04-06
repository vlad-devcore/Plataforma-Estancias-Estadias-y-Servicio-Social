import { motion } from "framer-motion";
import CrudRow from "./CrudRow";
import CrudPagination from "./CrudPagination";
import { Loader } from "react-feather";

const CrudTable = ({ data, columns, loading, error, onEdit, onDelete }) => {
  if (loading)
    return (
      <motion.div className="flex justify-center items-center p-8">
        <Loader className="animate-spin h-8 w-8 text-orange-500" />
      </motion.div>
    );

  if (error)
    return (
      <motion.div className="bg-red-50 text-red-600 p-4 rounded-lg">
        Error: {error}
      </motion.div>
    );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-lg shadow-sm overflow-hidden"
    >
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  className="text-left px-6 py-3 text-gray-500 font-medium tracking-wider"
                >
                  {col.header}
                </th>
              ))}
              <th className="text-left px-6 py-3 text-gray-500 font-medium tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {data.map((item) => (
              <CrudRow
              key={item.id_empresa || item.id_user}
                item={item}
                columns={columns}
                onEdit={() => onEdit(item)}  // ✅ Pasa el objeto completo al editar
                onDelete={() => onDelete(item.id_empresa || item.id_user)}
              />
            ))}
          </tbody>
        </table>
      </div>
      <CrudPagination total={data.length} />
    </motion.div>
  );
};

export default CrudTable;