import { useTranslation } from 'react-i18next';
import { Linking, View } from 'react-native';
import Animated from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import ButtonComp from '@/components/common/ButtonComp';
import Icon from '@/components/common/Icon';
import TextComp from '@/components/common/TextComp';
import { enterDown } from '@/config/motion';
import { fontFamily } from '@/styles/fontFamily';
import { ms } from '@/styles/scaling';
import { makeStyles, useColors } from '@/styles/theme';
import { radius } from '@/styles/tokens';

type Props = {
  onClose: () => void;
};

/**
 * Microphone refused. The system prompt only ever appears once, so sending the
 * learner to Settings is the only way back — and saying so plainly beats an
 * alert that dead-ends with "OK".
 */
export default function CoachDenied({ onClose }: Props) {
  const styles = useStyles();
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();

  return (
    <View style={[styles.root, { paddingTop: insets.top + ms(60) }]}>
      <Animated.View entering={enterDown()} style={styles.icon}>
        <Icon name="mic" size={30} color={colors.ink3} />
        <View style={styles.slash} />
      </Animated.View>

      <Animated.View entering={enterDown(80)} style={styles.copy}>
        <TextComp variant="h1" center>
          {t('coach.deniedTitle')}
        </TextComp>
        <TextComp style={styles.body} center>
          {t('coach.deniedBody')}
        </TextComp>
      </Animated.View>

      <View style={[styles.foot, { paddingBottom: Math.max(insets.bottom, ms(16)) }]}>
        <ButtonComp icon="sliders" onPress={() => Linking.openSettings()}>
          {t('coach.openSettings')}
        </ButtonComp>
        <ButtonComp variant="ghost" onPress={onClose}>
          {t('coach.notNow')}
        </ButtonComp>
      </View>
    </View>
  );
}

const useStyles = makeStyles((c) => ({
  root: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: ms(24),
  },
  icon: {
    width: ms(76),
    height: ms(76),
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: c.subtle,
  },
  /** Drawn rather than iconised, so it matches whatever the mic glyph is. */
  slash: {
    position: 'absolute',
    width: ms(52),
    height: ms(2.5),
    borderRadius: radius.pill,
    backgroundColor: c.ink3,
    transform: [{ rotate: '-45deg' }],
  },
  copy: {
    marginTop: ms(24),
    gap: ms(8),
    alignItems: 'center',
  },
  body: {
    fontFamily: fontFamily.medium,
    fontSize: ms(14.5),
    lineHeight: ms(21),
    color: c.ink2,
    maxWidth: ms(300),
  },
  foot: {
    marginTop: 'auto',
    alignSelf: 'stretch',
    gap: ms(4),
  },
}));
