import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import Avatar from '@/components/brand/Avatar';
import ButtonComp from '@/components/common/ButtonComp';
import Icon from '@/components/common/Icon';
import TextComp from '@/components/common/TextComp';
import { teacherByName } from '@/data/avatars';
import type { ScheduledClass } from '@/models/home';
import { makeStyles, useColors } from '@/styles/theme';
import { fontFamily } from '@/styles/fontFamily';
import { ms } from '@/styles/scaling';
import { radius, spacing } from '@/styles/tokens';

type Props = {
  scheduledClass: ScheduledClass;
  onEnter: () => void;
};

export default function JoinClassSheet({ scheduledClass, onEnter }: Props) {
  const styles = useStyles();
  const colors = useColors();
  const { t } = useTranslation();
  const teacher = teacherByName(scheduledClass.teacher);

  return (
    <View style={styles.root}>
      <View style={styles.avatarRing}>
        <Avatar uri={teacher.avatarUrl} name={teacher.name} size={84} />
      </View>

      <TextComp variant="h2" center>
        {scheduledClass.subject}
      </TextComp>
      <TextComp variant="body" center>
        {t('sheets.joinBody', { teacher: scheduledClass.teacher })}
      </TextComp>

      <View style={styles.checks}>
        <View style={styles.check}>
          <Icon name="mic" size={16} color={colors.ink2} />
          <TextComp style={styles.checkText}>{t('sheets.micReady')}</TextComp>
        </View>
        <View style={styles.check}>
          <Icon name="video" size={16} color={colors.ink2} />
          <TextComp style={styles.checkText}>{t('sheets.cameraReady')}</TextComp>
        </View>
      </View>

      <ButtonComp onPress={onEnter}>{t('sheets.enterClassroom')}</ButtonComp>
    </View>
  );
}

const useStyles = makeStyles((c) => ({
  root: {
    alignItems: 'center',
    gap: spacing.base,
  },
  avatarRing: {
    borderRadius: ms(50),
    borderWidth: 6,
    borderColor: c.teal50,
  },
  checks: {
    flexDirection: 'row',
    gap: spacing.sm,
    width: '100%',
  },
  check: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: ms(8),
    paddingVertical: ms(10),
    borderRadius: radius.sm,
    backgroundColor: c.bg,
  },
  checkText: {
    fontFamily: fontFamily.bold,
    fontSize: ms(12.5),
    lineHeight: ms(16.2),
    color: c.ink2,
  },
}));
