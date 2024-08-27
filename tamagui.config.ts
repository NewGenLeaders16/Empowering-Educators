import { createAnimations } from '@tamagui/animations-react-native';
import { createMedia } from '@tamagui/react-native-media-driver';
import { shorthands } from '@tamagui/shorthands';
import { themes, tokens } from '@tamagui/themes';
import {
  createTamagui,
  styled,
  SizableText,
  H1,
  YStack,
  Button as ButtonTamagui,
  createFont,
} from 'tamagui';
import { config as tmconfig } from '@tamagui/config/v3';

const animations = createAnimations({
  bouncy: {
    damping: 10,
    mass: 0.9,
    stiffness: 100,
    type: 'spring',
  },
  lazy: {
    damping: 20,
    type: 'spring',
    stiffness: 60,
  },
  quick: {
    damping: 20,
    mass: 1.2,
    stiffness: 250,
    type: 'spring',
  },
});

const urbanistFace = {
  normal: { normal: 'Urbanist' },
  bold: { normal: 'Urbanist-Bold' },
  300: { normal: 'Urbanist-Light' },
  500: { normal: 'Urbanist-Medium' },
  600: { normal: 'Urbanist-SemiBold' },
  700: { normal: 'Urbanist-Bold', italic: 'Urbanist-BoldItalic' },
  800: { normal: 'Urbanist-Bold' },
  900: { normal: 'Urbanist-Bold' },
};

const headingFont = createFont({
  size: tmconfig.fonts.heading.size,
  lineHeight: tmconfig.fonts.heading.lineHeight,
  weight: tmconfig.fonts.heading.weight,
  letterSpacing: tmconfig.fonts.heading.letterSpacing,
  face: urbanistFace,
});

const bodyFont = createFont({
  size: tmconfig.fonts.body.size,
  lineHeight: tmconfig.fonts.body.lineHeight,
  weight: tmconfig.fonts.body.weight,
  letterSpacing: tmconfig.fonts.body.letterSpacing,
  face: urbanistFace,
});

export const Container = styled(YStack, {
  flex: 1,
  padding: 24,
});

export const Main = styled(YStack, {
  flex: 1,
  justifyContent: 'space-between',
  maxWidth: 960,
});

export const Title = styled(H1, {
  color: '#000',
  size: '$12',
});

export const Subtitle = styled(SizableText, {
  color: '#38434D',
  size: '$9',
});

export const Button = styled(ButtonTamagui, {
  backgroundColor: '$primary_yellow',
  borderRadius: 28,
  maxWidth: 500,

  // Shaddows
  // shadowColor: '#000',
  // shadowOffset: {
  //   height: 2,
  //   width: 0,
  // },
  // shadowOpacity: 0.25,
  // shadowRadius: 3.84,

  // Button text
  color: '#000000',
  fontWeight: '600', // Is not passed down to the text. Probably a bug in Tamagui: https://github.com/tamagui/tamagui/issues/1156#issuecomment-1802594930
  fontSize: 16,
  fontFamily: '$body',
});

export const OutlinedButton = styled(ButtonTamagui, {
  borderColor: '$primary_yellow',
  borderWidth: 2,
  borderRadius: 28,
  maxWidth: 500,
  // Button text
  color: '$primary_yellow',
  fontWeight: '600', // Is not passed down to the text. Probably a bug in Tamagui: https://github.com/tamagui/tamagui/issues/1156#issuecomment-1802594930
  fontSize: 16,
  fontFamily: '$body',
});

const config = createTamagui({
  light: {
    color: {
      background: 'gray',
      text: 'black',
    },
  },
  defaultFont: 'body',
  animations,
  shouldAddPrefersColorThemes: true,
  themeClassNameOnRoot: true,
  shorthands,
  fonts: {
    body: bodyFont,
    heading: headingFont,
  },
  themes: {
    light: {
      primary_blue: '#10162c',
      primary_yellow: '#fdb813',
      white: '#ffffff',
      primary_grey: '#bdbec0',
      black: '#222222',
    },
    dark: {
      primary_blue: '#10162c',
      primary_yellow: '#fdb813',
      white: '#ffffff',
      primary_grey: '#bdbec0',
      black: '#222222',
    },
  },
  tokens,
  media: createMedia({
    xs: { maxWidth: 660 },
    sm: { maxWidth: 800 },
    md: { maxWidth: 1020 },
    lg: { maxWidth: 1280 },
    xl: { maxWidth: 1420 },
    xxl: { maxWidth: 1600 },
    gtXs: { minWidth: 660 + 1 },
    gtSm: { minWidth: 800 + 1 },
    gtMd: { minWidth: 1020 + 1 },
    gtLg: { minWidth: 1280 + 1 },
    short: { maxHeight: 820 },
    tall: { minHeight: 820 },
    hoverNone: { hover: 'none' },
    pointerCoarse: { pointer: 'coarse' },
  }),
});

type AppConfig = typeof config;

// Enable auto-completion of props shorthand (ex: jc="center") for Tamagui templates.
// Docs: https://tamagui.dev/docs/core/configuration

declare module 'tamagui' {
  interface TamaguiCustomConfig extends AppConfig {}
}

export default config;
