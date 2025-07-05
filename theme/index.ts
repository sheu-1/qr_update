export const colors = {
  // Base colors
  black: '#000000',
  darkGray: '#1a1a1a',
  mediumGray: '#2a2a2a',
  lightGray: '#888888',
  white: '#ffffff',
  
  // Accent colors
  primary: '#00FF00', // Bright green
  secondary: '#00A8FF', // Bright blue
  error: '#FF3B30', // Red for errors/delete actions
  
  // Text colors
  textPrimary: '#ffffff',
  textSecondary: '#888888',
  textTertiary: '#555555',
};

export const gradients = {
  primary: ['#000000', '#1a1a1a'],
  secondary: ['#1a1a1a', '#000000'],
};

export const typography = {
  h1: {
    fontSize: 32,
    fontWeight: '700',
    color: colors.textPrimary,
    fontFamily: 'Inter_700Bold',
  } as const,
  h2: {
    fontSize: 24,
    fontWeight: '600',
    color: colors.textPrimary,
    fontFamily: 'Inter_600SemiBold',
  } as const,
  body: {
    fontSize: 16,
    color: colors.textPrimary,
    fontFamily: 'Inter_400Regular',
  } as const,
  caption: {
    fontSize: 14,
    color: colors.textSecondary,
    fontFamily: 'Inter_400Regular',
  } as const,
  button: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.black,
    fontFamily: 'Inter_600SemiBold',
  } as const,
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const borderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
};

export const shadow = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
};

export default {
  colors,
  gradients,
  typography,
  spacing,
  borderRadius,
  shadow,
};
