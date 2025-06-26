
// Primary color scheme
export const primaryColors = {
  red: {
    light: '#f56565', // red-500
    default: '#e53e3e', // red-600
    dark: '#c53030', // red-700
  },
  orange: {
    light: '#ed8936', // orange-500
    default: '#dd6b20', // orange-600
    dark: '#c05621', // orange-700
  },
  blue: {
    light: '#4299e1', // blue-500
    default: '#3182ce', // blue-600
    dark: '#2b6cb0', // blue-700
  },
};

// UI color schemes
export const gradients = {
  redOrange: 'from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600',
  blueWhite: 'from-blue-500 to-blue-300 hover:from-blue-600 hover:to-blue-400',
  blackWhite: 'from-gray-900 to-gray-700 hover:from-black hover:to-gray-800',
};

// Text and background colors
export const uiColors = {
  text: {
    primary: 'text-white',
    secondary: 'text-gray-300',
    dark: 'text-gray-900',
    hover: {
      primary: 'hover:text-gray-300',
      secondary: 'hover:text-white',
      dark: 'hover:text-gray-700',
    }
  },
  background: {
    transparent: 'bg-transparent',
    dark: 'bg-black',
    light: 'bg-white',
    overlay: 'bg-black bg-opacity-95',
  },
  border: {
    light: 'border-white',
    dark: 'border-gray-900',
    primary: 'border-red-500',
  },
};

// Hover effect colors
export const hoverEffects = {
  underline: {
    redOrange: 'bg-gradient-to-r from-red-500 to-orange-500',
    blueWhite: 'bg-gradient-to-r from-blue-500 to-blue-300',
    blackWhite: 'bg-gradient-to-r from-gray-900 to-gray-700',
  },
};
