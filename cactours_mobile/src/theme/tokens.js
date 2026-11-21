import { Platform } from 'react-native'

export const colors = {
  mineralIvory: '#F2EFE6',
  turquesaCactours: '#026374',
  azulPetroleo: '#156275',
  azulBrillante: '#069BE0',
  blanco: '#FFFFFF',
  carbon: '#111111',
  ink: '#102629',
  muted: '#64736E',
  line: 'rgba(17, 17, 17, 0.1)',
  seaGlass: '#E4EFEB',
  sand: '#E9D9BD',
  gold: '#D5A76B',
  errorBg: '#FCE8E6',
  errorText: '#C5221F',
  successBg: '#E6F4EA',
  successText: '#137333',
}

export const spacing = {
  xs: 6,
  sm: 12,
  md: 18,
  lg: 24,
  xl: 32,
  xxl: 44,
}

export const radii = {
  sm: 8,
  md: 14,
  lg: 20,
  xl: 28,
  pill: 999,
}

export const shadows = {
  button: Platform.select({
    web: { boxShadow: '0px 7px 14px rgba(2, 99, 116, 0.18)' },
    default: {
      shadowColor: colors.turquesaCactours,
      shadowOffset: { width: 0, height: 7 },
      shadowOpacity: 0.18,
      shadowRadius: 14,
      elevation: 3,
    },
  }),
  focus: Platform.select({
    web: { boxShadow: '0px 4px 12px rgba(2, 99, 116, 0.1)' },
    default: {
      shadowColor: colors.turquesaCactours,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 9,
      elevation: 2,
    },
  }),
  subtle: Platform.select({
    web: { boxShadow: '0px 8px 18px rgba(21, 61, 60, 0.06)' },
    default: {
      shadowColor: '#153D3C',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.06,
      shadowRadius: 15,
      elevation: 3,
    },
  }),
  card: Platform.select({
    web: { boxShadow: '0px 12px 20px rgba(23, 58, 58, 0.14)' },
    default: {
      shadowColor: '#173A3A',
      shadowOffset: { width: 0, height: 12 },
      shadowOpacity: 0.14,
      shadowRadius: 19,
      elevation: 5,
    },
  }),
  hero: Platform.select({
    web: { boxShadow: '0px 18px 28px rgba(4, 45, 48, 0.2)' },
    default: {
      shadowColor: '#042D30',
      shadowOffset: { width: 0, height: 18 },
      shadowOpacity: 0.2,
      shadowRadius: 28,
      elevation: 8,
    },
  }),
  auth: Platform.select({
    web: { boxShadow: '0px 15px 25px rgba(21, 61, 60, 0.09)' },
    default: {
      shadowColor: '#153D3C',
      shadowOffset: { width: 0, height: 15 },
      shadowOpacity: 0.09,
      shadowRadius: 25,
      elevation: 5,
    },
  }),
  glow: Platform.select({
    web: { boxShadow: '0px 8px 18px rgba(2, 99, 116, 0.2)' },
    default: {
      shadowColor: colors.turquesaCactours,
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.2,
      shadowRadius: 18,
      elevation: 5,
    },
  }),
}
