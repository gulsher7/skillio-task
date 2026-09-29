import { router, usePathname } from 'expo-router';
import { useEffect, useState } from 'react';
import { ScrollView, View } from 'react-native';

import PressableScale from '@/components/common/PressableScale';
import Sheet from '@/components/common/Sheet';
import TextComp from '@/components/common/TextComp';
import { DEFAULTS } from '@/data/mock';
import { useHomeData } from '@/hooks/useHomeData';
import { useAppDispatch, useAppSelector } from '@/hooks/useRedux';
import {
  applyPreset,
  setHasClass,
  setHasSkillData,
  setPracticeDone,
  setSubscription,
  type SubscriptionState,
} from '@/redux/reducers/homeSlice';
import { resetOnboarding } from '@/redux/reducers/onboardingSlice';
import { makeStyles } from '@/styles/theme';

import { fontFamily } from '@/styles/fontFamily';
import { ms } from '@/styles/scaling';
import { radius, shadows, spacing } from '@/styles/tokens';
import { onDemoPanelOpen } from '@/utils/demoPanel';
import { focusHomeSection, type HomeSection } from '@/utils/homeFocus';

type Preset = {
  id: string;
  label: string;
  patch: Parameters<typeof applyPreset>[0];
  section: HomeSection;
};

/** The seven states the submission screenshots are taken from, in order. */
export const PRESETS: Preset[] = [
  { id: 'scheduled', label: 'Class scheduled', patch: {}, section: 'class' },
  { id: 'noclass', label: 'No class scheduled', patch: { hasClass: false }, section: 'class' },
  { id: 'notdone', label: 'Practice not completed', patch: {}, section: 'top' },
  { id: 'done', label: 'Practice completed', patch: { practiceDone: true }, section: 'top' },
  { id: 'noskills', label: 'No skill data', patch: { hasSkillData: false }, section: 'skills' },
  {
    id: 'nolessons',
    label: 'No lessons remaining',
    patch: { subscription: 'empty', lessonsRemaining: 0, hasClass: false },
    section: 'plan',
  },
  {
    id: 'nosub',
    label: 'No active subscription',
    patch: { subscription: 'none', lessonsRemaining: 0, hasClass: false },
    section: 'plan',
  },
];

export default function DemoPanel() {
  const styles = useStyles();
  const pathname = usePathname();
  const dispatch = useAppDispatch();
  const home = useAppSelector((s) => s.home);
  const data = useHomeData();

  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<'payload' | 'notes'>('payload');
  const [active, setActive] = useState<string | null>(null);

  useEffect(() => onDemoPanelOpen(() => setOpen(true)), []);

  if (!__DEV__ || !open) return null;

  const goHome = () => {
    if (pathname !== '/home') router.replace('/home');
  };

  const runPreset = (preset: Preset, close: () => void) => {
    dispatch(applyPreset(preset.patch));
    setActive(preset.id);
    goHome();
    close();
    setTimeout(() => focusHomeSection(preset.section), pathname === '/home' ? 400 : 700);
  };

  /** Any manual toggle drops the "this is preset N" badge. */
  const toggle = (apply: () => void) => {
    apply();
    setActive(null);
    goHome();
  };

  return (
    <Sheet onClose={() => setOpen(false)} label="Demo states" scrollable>
      {(close) => (
        <View style={styles.panel}>
          <View>
            <TextComp variant="h2">Demo states</TextComp>
            <TextComp variant="small">
              Dev-only. Flip the backend payload to see every state of Home.
            </TextComp>
          </View>

          <Group label="Flow">
            <View style={styles.row}>
              <Pill
                label="Onboarding"
                onPress={() => {
                  dispatch(resetOnboarding());
                  close();
                  router.replace('/welcome');
                }}
              />
              <Pill
                label="Home"
                active={pathname === '/home'}
                onPress={() => {
                  close();
                  goHome();
                }}
              />
              <Pill
                label="Practice"
                onPress={() => {
                  close();
                  router.push('/practice');
                }}
              />
            </View>
          </Group>

          <Group label="Key states for screenshots">
            {PRESETS.map((preset, index) => (
              <PressableScale
                key={preset.id}
                scaleTo={0.98}
                onPress={() => runPreset(preset, close)}
                accessibilityRole="button"
                accessibilityLabel={preset.label}
                style={[styles.preset, active === preset.id ? styles.presetActive : null]}
              >
                <View style={[styles.presetNum, active === preset.id ? styles.presetNumOn : null]}>
                  <TextComp
                    style={[
                      styles.presetNumText,
                      active === preset.id ? styles.presetNumTextOn : null,
                    ]}
                  >
                    {index + 1}
                  </TextComp>
                </View>
                <TextComp style={styles.presetLabel}>{preset.label}</TextComp>
              </PressableScale>
            ))}
          </Group>

          <Group label="Backend data">
            <Segmented
              label="Class"
              options={[
                { label: 'Scheduled', value: true },
                { label: 'null', value: false },
              ]}
              value={home.hasClass}
              onChange={(value) => toggle(() => dispatch(setHasClass(value)))}
            />
            <Segmented
              label="Practice"
              options={[
                { label: 'Not done', value: false },
                { label: 'Done', value: true },
              ]}
              value={home.practiceDone}
              onChange={(value) => toggle(() => dispatch(setPracticeDone(value)))}
            />
            <Segmented
              label="Skills"
              options={[
                { label: 'Data', value: true },
                { label: 'Empty', value: false },
              ]}
              value={home.hasSkillData}
              onChange={(value) => toggle(() => dispatch(setHasSkillData(value)))}
            />
            <Segmented
              label="Plan"
              options={[
                { label: 'Active', value: 'active' as SubscriptionState },
                { label: '0 left', value: 'empty' as SubscriptionState },
                { label: 'None', value: 'none' as SubscriptionState },
              ]}
              value={home.subscription}
              onChange={(value) => toggle(() => dispatch(setSubscription(value)))}
            />
          </Group>

          <Group label={tab === 'payload' ? 'Live payload' : 'Added fields'}>
            <View style={styles.row}>
              <Pill
                label="Live payload"
                active={tab === 'payload'}
                onPress={() => setTab('payload')}
              />
              <Pill label="Added fields" active={tab === 'notes'} onPress={() => setTab('notes')} />
            </View>

            {tab === 'payload' ? (
              <ScrollView horizontal style={styles.json} showsHorizontalScrollIndicator={false}>
                <TextComp style={styles.jsonText}>
                  {JSON.stringify(
                    data,
                    (key, value) => (key === 'avatarUrl' ? 'data:image/svg+xml;…' : value),
                    2,
                  )}
                </TextComp>
              </ScrollView>
            ) : (
              <View style={styles.notes}>
                {ADDED_FIELDS.map((note) => (
                  <View key={note.field}>
                    <TextComp style={styles.noteField}>{note.field}</TextComp>
                    <TextComp variant="small">{note.why}</TextComp>
                  </View>
                ))}
              </View>
            )}
          </Group>

          <TextComp variant="tiny" center>
            Renewal date and lesson counts come from {DEFAULTS.tier} defaults.
          </TextComp>
        </View>
      )}
    </Sheet>
  );
}

const ADDED_FIELDS = [
  {
    field: 'dailyPractice.topic · questionCount · estimatedMinutes · xpReward',
    why: 'The Start state needs a concrete promise: what you will do, how long it takes and what you earn.',
  },
  {
    field: 'dailyPractice.result',
    why: 'Score, accuracy, time and the per-skill breakdown power the completed card and View results.',
  },
  {
    field: 'gamification.*',
    why: 'The habit loop. Kept below the required sections so rewards support learning rather than compete with it.',
  },
  {
    field: 'scheduledClass.time as ISO',
    why: 'Lets the card show "Today · 6:30 PM" plus a live countdown.',
  },
];

function Group({ label, children }: { label: string; children: React.ReactNode }) {
  const styles = useStyles();
  return (
    <View style={styles.group}>
      <TextComp variant="eyebrow">{label}</TextComp>
      {children}
    </View>
  );
}

function Pill({
  label,
  active,
  onPress,
}: {
  label: string;
  active?: boolean;
  onPress: () => void;
}) {
  const styles = useStyles();
  return (
    <PressableScale
      onPress={onPress}
      scaleTo={0.96}
      accessibilityRole="button"
      accessibilityState={{ selected: !!active }}
      style={[styles.pill, active ? styles.pillActive : null]}
    >
      <TextComp style={[styles.pillText, active ? styles.pillTextActive : null]}>{label}</TextComp>
    </PressableScale>
  );
}

function Segmented<T extends string | boolean>({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: { label: string; value: T }[];
  value: T;
  onChange: (value: T) => void;
}) {
  const styles = useStyles();
  return (
    <View style={styles.segmentRow}>
      <TextComp style={styles.segmentLabel}>{label}</TextComp>
      <View style={styles.segment}>
        {options.map((option) => {
          const on = option.value === value;
          return (
            <PressableScale
              key={String(option.value)}
              onPress={() => onChange(option.value)}
              scaleTo={0.96}
              accessibilityRole="button"
              accessibilityState={{ selected: on }}
              style={[styles.segmentItem, on ? styles.segmentItemOn : null]}
            >
              <TextComp style={[styles.segmentText, on ? styles.segmentTextOn : null]}>
                {option.label}
              </TextComp>
            </PressableScale>
          );
        })}
      </View>
    </View>
  );
}

const useStyles = makeStyles((c) => ({
  panel: {
    gap: spacing.lg,
    paddingBottom: spacing.sm,
  },
  group: {
    gap: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    gap: ms(8),
  },
  pill: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: ms(9),
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: c.line,
    backgroundColor: c.bg,
  },
  pillActive: {
    backgroundColor: c.teal,
    borderColor: c.teal,
  },
  pillText: {
    fontFamily: fontFamily.bold,
    fontSize: ms(13),
    lineHeight: ms(16.9),
    color: c.ink,
  },
  pillTextActive: {
    color: c.surface,
  },
  preset: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: ms(10),
    paddingVertical: ms(8),
    paddingHorizontal: ms(8),
    borderRadius: radius.chip,
  },
  presetActive: {
    backgroundColor: c.teal50,
  },
  presetNum: {
    width: ms(22),
    height: ms(22),
    borderRadius: ms(7),
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: c.line,
    backgroundColor: c.bg,
  },
  presetNumOn: {
    backgroundColor: c.teal,
    borderColor: c.teal,
  },
  presetNumText: {
    fontFamily: fontFamily.black,
    fontSize: ms(11),
    lineHeight: ms(14.3),
    color: c.ink3,
  },
  presetNumTextOn: {
    color: c.surface,
  },
  presetLabel: {
    fontFamily: fontFamily.semibold,
    fontSize: ms(14),
    lineHeight: ms(18.2),
    color: c.ink,
  },
  segmentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: ms(8),
  },
  segmentLabel: {
    width: ms(66),
    fontFamily: fontFamily.semibold,
    fontSize: ms(13),
    lineHeight: ms(16.9),
    color: c.ink2,
  },
  segment: {
    flex: 1,
    flexDirection: 'row',
    gap: ms(2),
    padding: ms(2),
    borderRadius: radius.chip,
    borderWidth: 1,
    borderColor: c.line,
    backgroundColor: c.bg,
  },
  segmentItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: ms(6),
    borderRadius: ms(8),
  },
  segmentItemOn: {
    backgroundColor: c.surface,
    ...shadows.white,
  },
  segmentText: {
    fontFamily: fontFamily.bold,
    fontSize: ms(12),
    lineHeight: ms(15.6),
    color: c.ink3,
  },
  segmentTextOn: {
    color: c.ink,
  },
  json: {
    maxHeight: ms(240),
    borderRadius: radius.sm,
    backgroundColor: c.ink,
    padding: spacing.md,
  },
  jsonText: {
    fontFamily: 'Menlo',
    fontSize: ms(11),
    lineHeight: ms(17),
    color: '#CFEFF2',
  },
  notes: {
    gap: spacing.md,
  },
  noteField: {
    fontFamily: 'Menlo',
    fontSize: ms(11.5),
    lineHeight: ms(15),
    color: c.teal700,
    marginBottom: ms(2),
  },
}));
