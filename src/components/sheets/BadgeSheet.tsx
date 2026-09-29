import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import Animated, { ZoomIn } from 'react-native-reanimated';

import BadgeArt from '@/components/brand/BadgeArt';
import { enterDown } from '@/config/motion';
import TextComp from '@/components/common/TextComp';
import type { Badge } from '@/models/home';
import { makeStyles } from '@/styles/theme';

import { fontFamily } from '@/styles/fontFamily';
import { ms } from '@/styles/scaling';
import { radius, spacing } from '@/styles/tokens';
import { badgeKeys } from '@/utils/i18nKeys';

export default function BadgeSheet({ badge }: { badge: Badge }) {
  const styles = useStyles();
  const { t } = useTranslation();
  const keys = badgeKeys(badge);

  return (
    <View style={styles.root}>
      <Animated.View entering={ZoomIn.springify().damping(11).stiffness(170)}>
        <BadgeArt badge={badge} size={110} />
      </Animated.View>

      <Animated.View entering={enterDown(120)} style={styles.copy}>
        <TextComp variant="h2" center>
          {t(keys.name)}
        </TextComp>
        <TextComp variant="body" center>
          {t(keys.description)}
        </TextComp>
        <TextComp style={[styles.chip, badge.locked ? styles.chipLocked : null]}>
          {t(keys.earned)}
        </TextComp>
      </Animated.View>
    </View>
  );
}

const useStyles = makeStyles((c) => ({
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
    lineHeight: ms(16.2),
    paddingHorizontal: ms(10),
    paddingVertical: ms(5),
    borderRadius: radius.chip,
    overflow: 'hidden',
    backgroundColor: c.teal50,
    color: c.teal700,
  },
  chipLocked: {
    backgroundColor: c.bg,
    color: c.ink2,
  },
}));
