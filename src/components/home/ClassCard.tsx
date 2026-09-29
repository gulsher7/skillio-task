import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import Svg, { Circle, Path, Rect } from 'react-native-svg';

import Avatar from '@/components/brand/Avatar';
import ButtonComp from '@/components/common/ButtonComp';
import Card from '@/components/common/Card';
import Chip from '@/components/common/Chip';
import HintCard from '@/components/common/HintCard';
import SectionHeader from '@/components/common/SectionHeader';
import TextComp from '@/components/common/TextComp';
import { teacherByName } from '@/data/avatars';
import { useDayLabel } from '@/hooks/useDayLabel';
import { useNow } from '@/hooks/useNow';
import type { HomeData } from '@/models/home';
import { smoothLayout } from '@/config/motion';
import { makeStyles, useColors } from '@/styles/theme';
import { fontFamily } from '@/styles/fontFamily';
import { ms } from '@/styles/scaling';
import { radius, spacing } from '@/styles/tokens';
import { formatTime, monthShort, weekdayShort } from '@/utils/date';

/** A class counts as joinable from its start until 50 minutes in. */
const LIVE_WINDOW_MIN = 50;

type Props = {
  scheduledClass: HomeData['scheduledClass'];
  subscription: HomeData['subscription'];
  onJoin: () => void;
  onBook: () => void;
  highlightKey?: number | null;
};

function Countdown({ startsAt }: { startsAt: Date }) {
  const styles = useStyles();
  const colors = useColors();
  const { t } = useTranslation();
  const now = useNow();
  const minutes = (startsAt.getTime() - now) / 60000;

  if (minutes > 0 && minutes < 24 * 60) {
    const label =
      minutes >= 60
        ? t('class.startsInHours', {
            hours: Math.floor(minutes / 60),
            minutes: String(Math.floor(minutes % 60)).padStart(2, '0'),
          })
        : t('class.startsInMinutes', { count: Math.ceil(minutes) });
    return <Chip label={label} icon="clock" size="sm" />;
  }

  if (minutes <= 0 && minutes > -LIVE_WINDOW_MIN) {
    return (
      <Chip
        label={t('class.liveNow')}
        size="sm"
        color="#C22C50"
        background={colors.berry50}
        leading={<View style={styles.liveDot} />}
      />
    );
  }

  return null;
}

export default function ClassCard({
  scheduledClass,
  subscription,
  onJoin,
  onBook,
  highlightKey,
}: Props) {
  const styles = useStyles();
  const colors = useColors();
  const { t } = useTranslation();
  const noPlan = !subscription.tier;
  const noLessons = !!subscription.tier && subscription.lessonsRemaining === 0;

  return (
    <Card highlightKey={highlightKey}>
      <Animated.View layout={smoothLayout}>
        {scheduledClass ? (
          <ScheduledBody scheduledClass={scheduledClass} onJoin={onJoin} />
        ) : (
          <Animated.View
            key="empty"
            entering={FadeIn.duration(260)}
            exiting={FadeOut.duration(140)}
          >
            <View style={styles.emptyRow}>
              <CalendarPlusArt />
              <View style={styles.emptyCopy}>
                <TextComp variant="title">{t('class.emptyTitle')}</TextComp>
                <TextComp variant="small" style={styles.emptyText}>
                  {t('class.emptyBody')}
                </TextComp>
              </View>
            </View>

            {noPlan || noLessons ? (
              <HintCard background={colors.bg} color={colors.ink2} icon="info" style={styles.note}>
                {noPlan ? t('class.noPlanNote') : t('class.noLessonsNote')}
              </HintCard>
            ) : null}

            <ButtonComp variant="tonal" icon="calendarPlus" onPress={onBook} style={styles.cta}>
              {t('class.book')}
            </ButtonComp>
          </Animated.View>
        )}
      </Animated.View>
    </Card>
  );
}

function ScheduledBody({
  scheduledClass,
  onJoin,
}: {
  scheduledClass: NonNullable<HomeData['scheduledClass']>;
  onJoin: () => void;
}) {
  const styles = useStyles();
  const { t, i18n } = useTranslation();
  const dayLabel = useDayLabel();
  const startsAt = new Date(scheduledClass.time);
  const teacher = teacherByName(scheduledClass.teacher);

  return (
    <Animated.View key="scheduled" entering={FadeIn.duration(260)} exiting={FadeOut.duration(140)}>
      <SectionHeader title={t('class.title')} trailing={<Countdown startsAt={startsAt} />} />

      <View style={styles.row}>
        <View style={styles.dateBlock}>
          <TextComp style={styles.dateMonth}>{monthShort(startsAt, i18n.language)}</TextComp>
          <TextComp style={styles.dateDay}>{startsAt.getDate()}</TextComp>
          <TextComp style={styles.dateWeekday}>{weekdayShort(startsAt, i18n.language)}</TextComp>
        </View>

        <View style={styles.info}>
          <TextComp style={styles.when}>
            {dayLabel(startsAt)} · {formatTime(startsAt)}
          </TextComp>
          <View style={styles.teacher}>
            <Avatar uri={teacher.avatarUrl} name={teacher.name} size={36} online />
            <View style={styles.teacherText}>
              <TextComp style={styles.teacherName}>{scheduledClass.teacher}</TextComp>
              <TextComp variant="small">{scheduledClass.subject}</TextComp>
            </View>
          </View>
        </View>
      </View>

      <ButtonComp variant="tonal" icon="video" onPress={onJoin} style={styles.cta}>
        {t('class.join')}
      </ButtonComp>
    </Animated.View>
  );
}

function CalendarPlusArt() {
  const colors = useColors();
  const box = ms(72);
  return (
    <Svg width={box} height={box} viewBox="0 0 72 72">
      <Rect x="6" y="12" width="60" height="54" rx="16" fill={colors.teal50} />
      <Rect x="6" y="12" width="60" height="16" rx="8" fill={colors.teal100} />
      <Rect x="20" y="6" width="6" height="14" rx="3" fill={colors.teal} />
      <Rect x="46" y="6" width="6" height="14" rx="3" fill={colors.teal} />
      <Circle cx="36" cy="46" r="11" fill={colors.teal} />
      <Path d="M36 41v10M31 46h10" stroke="#FFFFFF" strokeWidth={3} strokeLinecap="round" />
      <Path d="M58 6l1.6 4 4 1.6-4 1.6L58 17l-1.6-3.8-4-1.6 4-1.6z" fill={colors.sun} />
    </Svg>
  );
}

const useStyles = makeStyles((c) => ({
  row: {
    flexDirection: 'row',
    gap: spacing.base,
  },
  dateBlock: {
    width: ms(72),
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: ms(10),
    borderRadius: radius.button,
    backgroundColor: c.teal50,
  },
  dateMonth: {
    fontFamily: fontFamily.black,
    fontSize: ms(11),
    lineHeight: ms(14.3),
    letterSpacing: 1.1,
    textTransform: 'uppercase',
    color: c.teal700,
  },
  dateDay: {
    fontFamily: fontFamily.display,
    fontSize: ms(28),
    lineHeight: ms(34),
    color: c.ink,
    fontVariant: ['tabular-nums'],
  },
  dateWeekday: {
    fontFamily: fontFamily.black,
    fontSize: ms(12),
    lineHeight: ms(15.6),
    color: c.teal700,
  },
  info: {
    flex: 1,
    justifyContent: 'center',
    gap: spacing.sm,
  },
  when: {
    fontFamily: fontFamily.black,
    fontSize: ms(15),
    lineHeight: ms(19.5),
    color: c.ink,
  },
  teacher: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: ms(10),
  },
  teacherText: {
    flex: 1,
  },
  teacherName: {
    fontFamily: fontFamily.bold,
    fontSize: ms(15),
    lineHeight: ms(19.5),
    color: c.ink,
  },
  liveDot: {
    width: ms(7),
    height: ms(7),
    borderRadius: ms(3.5),
    backgroundColor: c.berryInk,
  },
  emptyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.base,
  },
  emptyCopy: {
    flex: 1,
    gap: ms(2),
  },
  emptyText: {
    lineHeight: ms(19),
  },
  note: {
    marginTop: spacing.md,
  },
  cta: {
    marginTop: spacing.base,
  },
}));
