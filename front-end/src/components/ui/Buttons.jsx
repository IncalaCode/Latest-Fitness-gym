import { motion } from 'framer-motion';
import { gradients, uiColors } from '../../utils/themeColors';

/**
 * Primary button with gradient background and animation effects
 */
export const PrimaryButton = ({ children, onClick, className = '', colorScheme = 'redOrange' }) => {
  const gradientClass = gradients[colorScheme] || gradients.redOrange;
  
  return (
    <motion.button
      className={`bg-gradient-to-r ${gradientClass} ${uiColors.text.primary} px-4 py-2 rounded-full transition-colors ${className}`}
      onClick={onClick}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      {children}
    </motion.button>
  );
};

/**
 * Secondary button with transparent background and animation effects
 */
export const SecondaryButton = ({ children, onClick, className = '' }) => (
  <motion.button
    className={`${uiColors.text.primary} hover:${uiColors.text.hover.primary} transition-colors ${className}`}
    onClick={onClick}
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
  >
    {children}
  </motion.button>
);

/**
 * Outline button with border and transparent background
 */
export const OutlineButton = ({ children, onClick, className = '', colorScheme = 'light' }) => {
  const borderClass = uiColors.border[colorScheme] || uiColors.border.light;
  
  return (
    <motion.button
      className={`border-2 ${borderClass} ${uiColors.text.primary} px-4 py-2 rounded-full hover:bg-white hover:text-black transition-colors ${className}`}
      onClick={onClick}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      {children}
    </motion.button>
  );
};

/**
 * Icon button for UI elements that are just icons
 */
export const IconButton = ({ children, onClick, className = '' }) => (
  <motion.button
    className={`${uiColors.text.primary} focus:outline-none ${className}`}
    onClick={onClick}
    whileHover={{ scale: 1.1 }}
    whileTap={{ scale: 0.9 }}
  >
    {children}
  </motion.button>
);
