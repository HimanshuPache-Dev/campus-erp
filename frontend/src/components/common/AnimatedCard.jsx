import { motion } from 'framer-motion';

const AnimatedCard = ({ children, className = '', delay = 0, onClick }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.35, delay, ease: 'easeOut' }}
    whileHover={{ scale: 1.02, boxShadow: '0 8px 25px rgba(0,0,0,0.1)' }}
    className={className}
    onClick={onClick}
  >
    {children}
  </motion.div>
);

export default AnimatedCard;
