// src/components/management/icons/AnimatedIcon.jsx
import { motion } from 'framer-motion';

const AnimatedIcon = ({ children }) => (
  <motion.span
    initial={{ opacity: 0, x: -20 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ duration: 0.3 }}
  >
    {children}
  </motion.span>
);

export default AnimatedIcon;