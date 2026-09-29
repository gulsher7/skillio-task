import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, use, useCallback, useEffect, useMemo, useState } from 'react';
import {
  StyleSheet,
  useColorScheme,
  type ImageStyle,
  type TextStyle,
  type ViewStyle,
} from 'react-native';

import { darkPalette, lightPalette, type Palette } from './palette';

export type ThemeChoice = 'system' | 'light' | 'dark';
export type Scheme = 'light' | 'dark';

const STORAGE_KEY = 'skillio.theme';

type ThemeValue = {
  scheme: Scheme;
  choice: ThemeChoice;
  colors: Palette;
  setChoice: (choice: ThemeChoice) => void;
  toggle: () => void;
};

const ThemeContext = createContext<ThemeValue>({
  scheme: 'light',
  choice: 'system',
  colors: lightPalette,
  setChoice: () => {},
  toggle: () => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const system = useColorScheme();
  const [choice, setChoiceState] = useState<ThemeChoice>('system');

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((saved) => {
        if (saved === 'light' || saved === 'dark' || saved === 'system') setChoiceState(saved);
      })
      .catch(() => {});
  }, []);

  const scheme: Scheme = choice === 'system' ? (system === 'dark' ? 'dark' : 'light') : choice;

  const setChoice = useCallback((next: ThemeChoice) => {
    setChoiceState(next);
    AsyncStorage.setItem(STORAGE_KEY, next).catch(() => {});
  }, []);

  const toggle = useCallback(() => {
    setChoice(scheme === 'dark' ? 'light' : 'dark');
  }, [scheme, setChoice]);

  const value = useMemo<ThemeValue>(
    () => ({
      scheme,
      choice,
      colors: scheme === 'dark' ? darkPalette : lightPalette,
      setChoice,
      toggle,
    }),
    [scheme, choice, setChoice, toggle],
  );

  return <ThemeContext value={value}>{children}</ThemeContext>;
}

export function useTheme() {
  return use(ThemeContext);
}

export function useColors() {
  return use(ThemeContext).colors;
}

type Styles = Record<string, ViewStyle | TextStyle | ImageStyle>;

/**
 * Same ergonomics as `StyleSheet.create`, except the sheet is a function of the
 * palette and is rebuilt (once, memoised) when the theme flips.
 *
 *   const useStyles = makeStyles((c) => ({ card: { backgroundColor: c.surface } }));
 *   ...
 *   const styles = useStyles();
 */
export function makeStyles<T extends Styles>(build: (colors: Palette) => T) {
  const light = StyleSheet.create(build(lightPalette));
  const dark = StyleSheet.create(build(darkPalette));
  return function useStyles(): T {
    return useTheme().scheme === 'dark' ? dark : light;
  };
}
