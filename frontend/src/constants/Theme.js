export const Theme = {
  colors: {
    primary: '#007AFF', // Classic Apple Blue
    secondary: '#5856D6', // Purple
    success: '#34C759', // Green
    warning: '#FF9500', // Orange
    danger: '#FF3B30', // Red
    background: '#F2F2F7', // Apple Light Gray background
    card: '#FFFFFF', // Pure White
    text: '#1C1C1E', // Nearly Black
    textSecondary: '#8E8E93', // Cool Gray
    border: '#C6C6C8',
    glass: 'rgba(255, 255, 255, 0.7)',
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
  },
  borderRadius: {
    sm: 8,
    md: 12,
    lg: 20,
    xl: 30,
    round: 50,
  },
  shadows: {
    light: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 10,
      elevation: 2,
    },
    medium: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 15,
      elevation: 4,
    },
  }
};
