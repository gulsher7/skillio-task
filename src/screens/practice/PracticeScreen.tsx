import { router } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import Animated, {
  FadeIn,
  SlideInDown,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import ButtonComp from '@/components/common/ButtonComp';
import Icon from '@/components/common/Icon';
import IconButton from '@/components/common/IconButton';
import PressableScale from '@/components/common/PressableScale';
import ProgressBar from '@/components/common/ProgressBar';
import TextComp from '@/components/common/TextComp';
import { duration, easeOut, enterDown, STAGGER } from '@/config/motion';
import { SKILL_ICON } from '@/data/mock';
import { QUESTIONS } from '@/data/questions';
import { useAppDispatch } from '@/hooks/useRedux';
import type { PracticeResult, SkillKey } from '@/models/home';
import { completePractice } from '@/redux/reducers/homeSlice';
import { makeStyles, useColors } from '@/styles/theme';
import { fontFamily } from '@/styles/fontFamily';
import { ms } from '@/styles/scaling';
import { radius, spacing } from '@/styles/tokens';
import { haptics } from '@/utils/haptics';
import { skillKeys } from '@/utils/i18nKeys';

const KEYS = ['A', 'B', 'C', 'D'];

/**
 * Non-breaking spaces, because plain spaces at the edge of a nested <Text> get
 * trimmed and an underline over nothing draws nothing — which left the blank
 * invisible.
 */
const NBSP = '\u00A0';
const EMPTY_GAP = NBSP.repeat(7);
const PRAISE = ['practice.praise1', 'practice.praise2', 'practice.praise3'];

type Answer = { skill: SkillKey; correct: boolean; right: string };

export default function PracticeScreen() {
  const styles = useStyles();
  const colors = useColors();
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const dispatch = useAppDispatch();

  const [index, setIndex] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [checked, setChecked] = useState(false);
  const answers = useRef<Answer[]>([]);
  const startedAt = useRef(0);

  useEffect(() => {
    startedAt.current = Date.now();
  }, []);

  const question = QUESTIONS[index];
  const tone = { color: colors.skill[question.skill], tint: colors.skillTint[question.skill] };
  const isRight = picked === question.correct;
  const isLast = index === QUESTIONS.length - 1;

  const shake = useSharedValue(0);
  const wrongShake = useAnimatedStyle(() => ({ transform: [{ translateX: shake.get() }] }));

  const check = () => {
    setChecked(true);
    answers.current.push({
      skill: question.skill,
      correct: isRight,
      right: question.answers[question.correct],
    });

    if (isRight) {
      haptics.success();
    } else {
      haptics.error();
      shake.set(
        withSequence(
          withRepeat(withTiming(ms(6), { duration: 60 }), 4, true),
          withTiming(0, { duration: 60 }),
        ),
      );
    }
  };

  const advance = () => {
    if (!isLast) {
      setIndex(index + 1);
      setPicked(null);
      setChecked(false);
      return;
    }

    const all = answers.current;
    const correct = all.filter((a) => a.correct).length;
    const bySkill: PracticeResult['bySkill'] = {};
    all.forEach((answer) => {
      const entry = bySkill[answer.skill] ?? [0, 0];
      entry[1] += 1;
      if (answer.correct) entry[0] += 1;
      bySkill[answer.skill] = entry;
    });

    dispatch(
      completePractice({
        correct,
        total: all.length,
        seconds: Math.max(60, Math.round((Date.now() - (startedAt.current || Date.now())) / 1000)),
        accuracy: Math.round((correct / all.length) * 100),
        bySkill,
        missed: all.filter((a) => !a.correct).map((a) => a.right),
      }),
    );
    router.replace('/celebrate');
  };

  const progress = (index + (checked ? 1 : 0)) / QUESTIONS.length;

  return (
    <View style={styles.root}>
      <View style={[styles.header, { paddingTop: insets.top + ms(4) }]}>
        <IconButton name="x" label={t('practice.close')} onPress={() => router.back()} />
        <ProgressBar
          progress={progress}
          height={ms(12)}
          gradient={['#34C6D3', colors.teal]}
          track="#DFEBED"
          animationDuration={duration.base}
          style={styles.bar}
          accessibilityLabel={t('practice.progressA11y', {
            current: index + 1,
            total: QUESTIONS.length,
          })}
        />
        <TextComp style={styles.count}>
          {index + 1}/{QUESTIONS.length}
        </TextComp>
      </View>

      <View style={styles.body} key={index}>
        <Animated.View entering={enterDown()} style={styles.stack}>
          <View style={[styles.skillChip, { backgroundColor: tone.tint }]}>
            <Icon
              name={SKILL_ICON[question.skill]}
              size={14}
              color={tone.color}
              strokeWidth={2.6}
            />
            <TextComp style={[styles.skillLabel, { color: tone.color }]}>
              {t(skillKeys(question.skill).label)}
            </TextComp>
          </View>

          <TextComp style={styles.prompt}>
            {question.gapFill ? (
              <>
                {t(`practice.${question.id}`)}
                <TextComp style={[styles.gap, picked == null ? styles.gapEmpty : null]}>
                  {picked != null ? `${NBSP}${question.answers[picked]}${NBSP}` : EMPTY_GAP}
                </TextComp>
                {t(`practice.${question.id}b`)}
              </>
            ) : (
              t(`practice.${question.id}`)
            )}
          </TextComp>

          <View style={styles.answers}>
            {question.answers.map((answer, position) => {
              const selected = picked === position;
              const revealCorrect = checked && position === question.correct;
              const revealWrong = checked && selected && !isRight;

              const content = (
                <View
                  style={[
                    styles.answer,
                    selected && !checked ? styles.answerSelected : null,
                    revealCorrect ? styles.answerRight : null,
                    revealWrong ? styles.answerWrong : null,
                    checked && !revealCorrect && !revealWrong ? styles.answerDimmed : null,
                  ]}
                >
                  <View
                    style={[
                      styles.key,
                      selected && !checked ? styles.keySelected : null,
                      revealCorrect ? styles.keyRight : null,
                      revealWrong ? styles.keyWrong : null,
                    ]}
                  >
                    <TextComp
                      style={[
                        styles.keyText,
                        selected && !checked ? styles.keyTextSelected : null,
                        revealCorrect || revealWrong ? styles.keyTextReveal : null,
                      ]}
                    >
                      {KEYS[position]}
                    </TextComp>
                  </View>
                  <TextComp style={styles.answerText}>{answer}</TextComp>
                </View>
              );

              return (
                <PressableScale
                  key={answer}
                  haptic="select"
                  scaleTo={0.975}
                  disabled={checked}
                  onPress={() => setPicked(position)}
                  accessibilityRole="radio"
                  accessibilityState={{ selected, disabled: checked }}
                  accessibilityLabel={`${KEYS[position]}. ${answer}`}
                >
                  {revealWrong ? (
                    <Animated.View style={wrongShake}>{content}</Animated.View>
                  ) : (
                    content
                  )}
                </PressableScale>
              );
            })}
          </View>
        </Animated.View>
      </View>

      {checked ? (
        <Animated.View
          entering={SlideInDown.duration(duration.base).easing(easeOut)}
          accessibilityLiveRegion="polite"
          style={[
            styles.feedback,
            isRight ? styles.feedbackRight : styles.feedbackWrong,
            { paddingBottom: insets.bottom + spacing.xl },
          ]}
        >
          <View style={styles.feedbackTop}>
            <Animated.View
              entering={FadeIn.delay(STAGGER)}
              style={[
                styles.feedbackIcon,
                { backgroundColor: isRight ? colors.mint : colors.berry },
              ]}
            >
              <Icon
                name={isRight ? 'check' : 'x'}
                size={22}
                color={colors.onAccent}
                strokeWidth={3.2}
              />
            </Animated.View>
            <View style={styles.feedbackText}>
              <TextComp
                style={[
                  styles.feedbackTitle,
                  { color: isRight ? colors.mintInk : colors.berryInk },
                ]}
              >
                {isRight ? t(PRAISE[index % PRAISE.length]) : t('practice.notQuite')}
              </TextComp>
              <TextComp
                style={[styles.feedbackBody, { color: isRight ? colors.mintInk : colors.berryInk }]}
              >
                {isRight
                  ? t(`practice.${question.id}why`)
                  : t('practice.answerIs', {
                      answer: question.answers[question.correct],
                      why: t(`practice.${question.id}why`),
                    })}
              </TextComp>
            </View>
          </View>

          <ButtonComp variant={isRight ? 'ok' : 'no'} onPress={advance}>
            {t(isLast ? 'practice.finish' : 'common.continue')}
          </ButtonComp>
        </Animated.View>
      ) : (
        <View style={[styles.footer, { paddingBottom: insets.bottom + spacing.lg }]}>
          <ButtonComp onPress={check} disabled={picked == null}>
            {t('practice.check')}
          </ButtonComp>
        </View>
      )}
    </View>
  );
}

const useStyles = makeStyles((c) => ({
  root: {
    flex: 1,
    backgroundColor: c.bg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: ms(14),
    paddingHorizontal: spacing.gutter,
    paddingBottom: spacing.sm,
  },
  bar: {
    flex: 1,
  },
  count: {
    minWidth: ms(34),
    textAlign: 'right',
    fontFamily: fontFamily.black,
    fontSize: ms(13),
    lineHeight: ms(16.9),
    color: c.ink3,
    fontVariant: ['tabular-nums'],
  },
  body: {
    flex: 1,
    paddingHorizontal: spacing.gutter,
    paddingTop: spacing.base,
  },
  stack: {
    gap: spacing.lg,
  },
  skillChip: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: ms(6),
    paddingHorizontal: ms(10),
    paddingVertical: ms(6),
    borderRadius: radius.chip,
  },
  skillLabel: {
    fontFamily: fontFamily.black,
    fontSize: ms(12),
    lineHeight: ms(15.6),
    letterSpacing: 0.9,
    textTransform: 'uppercase',
  },
  prompt: {
    fontFamily: fontFamily.displayBold,
    fontSize: ms(25),
    lineHeight: ms(32),
    letterSpacing: -0.5,
    color: c.ink,
  },
  gap: {
    fontFamily: fontFamily.displayBold,
    fontSize: ms(25),
    lineHeight: ms(32),
    color: c.teal700,
    backgroundColor: c.teal50,
    textDecorationLine: 'underline',
    textDecorationColor: c.teal,
  },
  /** An unanswered blank is a tinted slot, so it reads as something to fill. */
  gapEmpty: {
    backgroundColor: c.teal100,
  },
  answers: {
    gap: spacing.md,
  },
  answer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: ms(16),
    paddingHorizontal: ms(18),
    borderRadius: radius.button,
    borderWidth: 2,
    borderColor: c.line,
    backgroundColor: c.surface,
  },
  answerSelected: {
    borderColor: c.teal,
    backgroundColor: c.selectedCard,
  },
  answerRight: {
    borderColor: c.mint,
    backgroundColor: c.mint50,
  },
  answerWrong: {
    borderColor: c.berry,
    backgroundColor: c.berry50,
  },
  answerDimmed: {
    opacity: 0.55,
  },
  key: {
    width: ms(28),
    height: ms(28),
    borderRadius: ms(9),
    borderWidth: 2,
    borderColor: c.line,
    alignItems: 'center',
    justifyContent: 'center',
  },
  keySelected: {
    borderColor: c.teal,
  },
  keyRight: {
    borderColor: c.mint,
    backgroundColor: c.mint,
  },
  keyWrong: {
    borderColor: c.berry,
    backgroundColor: c.berry,
  },
  keyText: {
    fontFamily: fontFamily.black,
    fontSize: ms(12.5),
    lineHeight: ms(16.2),
    color: c.ink3,
  },
  keyTextSelected: {
    color: c.teal,
  },
  keyTextReveal: {
    color: c.onAccent,
  },
  answerText: {
    flex: 1,
    fontFamily: fontFamily.bold,
    fontSize: ms(16),
    lineHeight: ms(20.8),
    color: c.ink,
  },
  footer: {
    paddingHorizontal: spacing.gutter,
    paddingTop: spacing.base,
  },
  feedback: {
    gap: spacing.base,
    paddingTop: spacing.card,
    paddingHorizontal: spacing.gutter,
    borderTopLeftRadius: ms(28),
    borderTopRightRadius: ms(28),
  },
  feedbackRight: {
    backgroundColor: c.mint50,
  },
  feedbackWrong: {
    backgroundColor: c.berry50,
  },
  feedbackTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  feedbackIcon: {
    width: ms(40),
    height: ms(40),
    borderRadius: ms(20),
    alignItems: 'center',
    justifyContent: 'center',
  },
  feedbackText: {
    flex: 1,
  },
  feedbackTitle: {
    fontFamily: fontFamily.display,
    fontSize: ms(21),
    lineHeight: ms(26.9),
  },
  feedbackBody: {
    fontFamily: fontFamily.semibold,
    fontSize: ms(14),
    lineHeight: ms(19),
  },
}));
