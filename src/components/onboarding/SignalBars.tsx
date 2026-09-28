import { StyleSheet, View } from 'react-native';

import { colors } from '@/styles/colors';
import { ms } from '@/styles/scaling';

/** Five rising bars; `level` (0-4) sets how many are lit. */
export default function SignalBars({ level }: { level: number }) {
  return (
    <View style={styles.row}>
      {[0, 1, 2, 3, 4].map((i) => (
        <View
          key={i}
          style={[
            styles.bar,
            { height: ms(6 + i * 4), backgroundColor: i <= level ? colors.teal : '#D5E4E7' },
          ]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: ms(3),
    height: ms(22),
    width: ms(35),
  },
  bar: {
    width: ms(5),
    borderRadius: ms(2),
  },
});
