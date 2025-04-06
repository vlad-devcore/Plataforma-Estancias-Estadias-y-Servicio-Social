// src/components/management/icons/ManagementIcon.jsx
import { motion } from 'framer-motion';

const ManagementIcon = ({ icon = 'users' }) => {
  const icons = {
    users: (
      <motion.svg 
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        className="w-6 h-6 text-purple-600 mr-2" 
        viewBox="0 0 24 24" 
        fill="currentColor"
      >
        <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
      </motion.svg>
    ),
    business: (
      <motion.svg
        className="w-6 h-6 text-blue-600 mr-2"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
      </motion.svg>
    )
  };

  return icons[icon] || null;
};

export default ManagementIcon;