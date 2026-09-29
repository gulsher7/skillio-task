import { BlurView } from 'expo-blur';
import { StyleSheet, View } from 'react-native';

import { makeStyles, useTheme } from '@/styles/theme';

/**
 * What the coach sits on, for every phase it has.
 *
 * Reading is the whole task, so this is all but opaque — the blur behind it is
 * only there to give the morph somewhere to grow out of. It deliberately does
 * not use the shared `scrim`, which is dark in both themes and would bury the
 * line you are meant to be reading.
 */
export default function CoachBackdrop() {
  const styles = useStyles();
  const { scheme } = useTheme();

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <BlurView
        intensity={scheme === 'dark' ? 60 : 40}
        tint={scheme === 'dark' ? 'dark' : 'light'}
        style={StyleSheet.absoluteFill}
      />
      <View style={styles.wash} />
    </View>
  );
}

const useStyles = makeStyles((c) => ({
  wash: {
    ...StyleSheet.absoluteFill,
    backgroundColor: c.bg,
    opacity: 0.94,
  },
}));
