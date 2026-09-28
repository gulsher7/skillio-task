import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import Avatar from '@/components/brand/Avatar';
import Buddy from '@/components/brand/Buddy';
import ButtonComp from '@/components/common/ButtonComp';
import Icon from '@/components/common/Icon';
import PressableScale from '@/components/common/PressableScale';
import TextComp from '@/components/common/TextComp';
import { TEACHERS } from '@/data/avatars';
import { CLASS_SLOTS, type ClassSlot } from '@/data/mock';
import type { HomeData } from '@/models/home';
import { colors } from '@/styles/colors';
import { fontFamily } from '@/styles/fontFamily';
import { ms } from '@/styles/scaling';
import { radius, spacing } from '@/styles/tokens';
import { atDayOffset, dayLabel, formatTime } from '@/utils/date';

const BOOKING_MS = 900;
const CONFIRM_MS = 650;

type Props = {
  subscription: HomeData['subscription'];
  onBooked: (slot: ClassSlot) => void;
  onSeePlans: () => void;
  onTopUp: () => void;
  onClose: () => void;
};

export default function BookClassSheet({
  subscription,
  onBooked,
  onSeePlans,
  onTopUp,
  onClose,
}: Props) {
  const [selected, setSelected] = useState(CLASS_SLOTS[0].id);
  const [state, setState] = useState<'idle' | 'booking' | 'booked'>('idle');

  const noPlan = !subscription.tier;
  const outOfLessons = !noPlan && subscription.lessonsRemaining === 0;

  if (noPlan || outOfLessons) {
    return (
      <View style={styles.upsell}>
        <Buddy size={96} float={false} id="book-upsell" />
        <TextComp variant="h2" center>
          {noPlan ? 'Live classes need a plan' : "You're out of lessons"}
        </TextComp>
        <TextComp variant="body" center>
          {noPlan
            ? 'Pick a plan to book 1-on-1 classes with our teachers. Your streak and XP carry over.'
            : `You used all ${subscription.totalLessons} lessons this cycle. Add a pack now or wait until the renewal.`}
        </TextComp>
        <ButtonComp
          onPress={() => {
            onClose();
            setTimeout(noPlan ? onSeePlans : onTopUp, 280);
          }}
        >
          {noPlan ? 'See plans' : 'Get more lessons'}
        </ButtonComp>
      </View>
    );
  }

  const book = () => {
    setState('booking');
    setTimeout(() => {
      setState('booked');
      setTimeout(() => {
        const slot = CLASS_SLOTS.find((s) => s.id === selected) ?? CLASS_SLOTS[0];
        onClose();
        onBooked(slot);
      }, CONFIRM_MS);
    }, BOOKING_MS);
  };

  return (
    <View style={styles.root}>
      <View>
        <TextComp variant="h2">Book a class</TextComp>
        <TextComp variant="small">
          Uses 1 of your {subscription.lessonsRemaining} remaining lessons.
        </TextComp>
      </View>

      <View style={styles.slots} accessibilityRole="radiogroup">
        {CLASS_SLOTS.map((slot) => {
          const at = atDayOffset(slot.dayOffset, slot.hour, slot.minute);
          const teacher = TEACHERS[slot.teacher];
          const active = selected === slot.id;
          return (
            <PressableScale
              key={slot.id}
              haptic="select"
              scaleTo={0.98}
              onPress={() => setSelected(slot.id)}
              accessibilityRole="radio"
              accessibilityState={{ selected: active }}
              accessibilityLabel={`${dayLabel(at)} ${formatTime(at)} with ${teacher.name}, ${slot.subject}`}
              style={[styles.slot, active ? styles.slotActive : null]}
            >
              <Avatar uri={teacher.avatarUrl} name={teacher.name} size={44} />
              <View style={styles.slotText}>
                <TextComp style={styles.slotWhen}>
                  {dayLabel(at)} · {formatTime(at)}
                </TextComp>
                <TextComp variant="small">
                  {teacher.name} · {slot.subject}
                </TextComp>
              </View>
              <View style={[styles.tick, active ? styles.tickOn : null]}>
                {active ? (
                  <Icon name="check" size={15} color={colors.surface} strokeWidth={3.4} />
                ) : null}
              </View>
            </PressableScale>
          );
        })}
      </View>

      <ButtonComp
        onPress={book}
        loading={state === 'booking'}
        disabled={state !== 'idle'}
        icon={state === 'booked' ? 'check' : undefined}
      >
        {state === 'booked' ? 'Booked' : 'Book class'}
      </ButtonComp>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    gap: spacing.base,
  },
  slots: {
    gap: spacing.md,
  },
  slot: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radius.option,
    borderWidth: 2,
    borderColor: colors.line,
  },
  slotActive: {
    borderColor: colors.teal,
    backgroundColor: colors.selectedCard,
  },
  slotText: {
    flex: 1,
  },
  slotWhen: {
    fontFamily: fontFamily.black,
    fontSize: ms(15),
    color: colors.ink,
  },
  tick: {
    width: ms(26),
    height: ms(26),
    borderRadius: ms(13),
    borderWidth: 2,
    borderColor: '#CFDDE0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tickOn: {
    borderColor: colors.teal,
    backgroundColor: colors.teal,
  },
  upsell: {
    alignItems: 'center',
    gap: spacing.lg,
    paddingTop: spacing.sm,
  },
});
