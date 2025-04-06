import { motion } from "framer-motion";
import CrudActions from "./CrudActions";

const CrudRow = ({ item, index, columns, onEdit, onDelete }) => (
  <motion.tr
    initial={{ opacity: 0, x: -20 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ duration: 0.3, delay: index * 0.1 }}
    className="hover:bg-gray-50"
  >
    {columns.map((col) => (
  <td key={col.key} className="px-6 py-4"> {/* ✅ Key única por columna */}
    {col.render ? col.render(item[col.key]) : item[col.key]}
  </td>
))}
    <td className="px-6 py-4">
    <CrudActions
  onEdit={() => onEdit(item.id_user || item.id_empresa)} // Adaptar según tu API
  onDelete={() => onDelete(item.id_user || item.id_empresa)}
/>
    </td>
  </motion.tr>
);

export default CrudRow;
