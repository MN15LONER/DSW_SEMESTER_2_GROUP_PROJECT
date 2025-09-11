// South African inspired color palette
import { DefaultTheme } from "react-native-paper";


export const COLORS = {
  // Primary brand colors
  primary: '#1B5E20', // Deep green (SA flag inspired)
  primaryLight: '#4CAF50',
  primaryDark: '#0D4E14',
  
  // Secondary colors
  secondary: '#FF9800', // Orange (SA flag inspired)
  secondaryLight: '#FFB74D',
  secondaryDark: '#F57C00',
  
  // Accent colors
  accent: '#FFD700', // Gold (SA colors)
  accentLight: '#FFF176',
  accentDark: '#FBC02D',
  
  // Status colors
  success: '#4CAF50',
  warning: '#FF9800',
  error: '#F44336',
  info: '#2196F3',
  
  // Neutral colors
  white: '#FFFFFF',
  black: '#000000',
  gray: '#757575',
  lightGray: '#BDBDBD',
  darkGray: '#424242',
  
  // Background colors
  background: '#F5F5F5',
  surface: '#FFFFFF',
  
  // Special colors for promotions
  lightGreen: '#E8F5E8',
  lightOrange: '#FFF3E0',
  lightBlue: '#E3F2FD',
  
  // Text colors
  textPrimary: '#212121',
  textSecondary: '#757575',
  textHint: '#BDBDBD',
  textInverse: '#FFFFFF',
};

export const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: COLORS.primary,
    accent: COLORS.secondary,
    background: COLORS.background,
    surface: COLORS.surface,
    text: COLORS.textPrimary,
  },
};