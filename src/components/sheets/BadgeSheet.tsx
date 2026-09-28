import { StyleSheet, View } from 'react-native';
import Animated, { FadeInDown, ZoomIn } from 'react-native-reanimated';

import BadgeArt from '@/components/brand/BadgeArt';
import TextComp from '@/components/common/TextComp';
import type { Badge } from '@/models/home';
import { colors } from '@/styles/colors';
import { fontFamily } from '@/styles/fontFamily';
import { ms } from '@/styles/scaling';
import { radius, spacing } from '@/styles/tokens';

export default function BadgeSheet({ badge }: { badge: Badge }) {
  return (
    <View style={styles.root}>
      <Animated.View entering={ZoomIn.springify().damping(11).stiffness(170)}>
        <BadgeArt badge={badge} size={110} />
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(120).springify().damping(18)} style={styles.copy}>
        <TextComp variant="h2" center>
          {badge.name}
        </TextComp>
        <TextComp variant="body" center>
          {badge.description}
        </TextComp>
        <TextComp style={[styles.chip, badge.locked ? styles.chipLocked : null]}>
          {badge.earnedLabel}
        </TextComp>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    alignItems: 'center',
    gap: spacing.md,
    paddingBottom: spacing.sm,
  },
  copy: {
    alignItems: 'center',
    gap: spacing.sm,
  },
  chip: {
    fontFamily: fontFamily.bold,
    fontSize: ms(12.5),
    paddingHorizontal: ms(10),
    paddingVertical: ms(5),
    borderRadius: radius.chip,
    overflow: 'hidden',
    backgroundColor: colors.teal50,
    color: colors.teal700,
  },
  chipLocked: {
    backgroundColor: colors.bg,
    color: colors.ink2,
  },
});
