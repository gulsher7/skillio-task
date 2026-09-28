import { StyleSheet, View } from 'react-native';

import { ms } from '@/styles/scaling';
import { spacing } from '@/styles/tokens';

import TextComp from './TextComp';

type Props = {
  title: string;
  /** Countdown chip, "Tap a skill" nudge, a link — whatever belongs on the right. */
  trailing?: React.ReactNode;
  leading?: React.ReactNode;
};

export default function SectionHeader({ title, trailing, leading }: Props) {
  return (
    <View style={styles.row}>
      <View style={styles.titleRow}>
        {leading}
        <TextComp variant="title" numberOfLines={1}>
          {title}
        </TextComp>
      </View>
      {trailing}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: ms(10),
    marginBottom: spacing.base,
  },
  titleRow: {
    flexShrink: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: ms(6),
  },
});
