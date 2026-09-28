import { router } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  FadeIn,
  FadeInDown,
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
import { duration, STAGGER } from '@/config/motion';
import { SKILL_META } from '@/data/mock';
import { QUESTIONS } from '@/data/questions';
import { useAppDispatch } from '@/hooks/useRedux';
import type { PracticeResult, SkillKey } from '@/models/home';
import { completePractice } from '@/redux/reducers/homeSlice';
import { colors } from '@/styles/colors';
import { fontFamily } from '@/styles/fontFamily';
import { ms } from '@/styles/scaling';
import { radius, spacing } from '@/styles/tokens';
import { haptics } from '@/utils/haptics';

const KEYS = ['A', 'B', 'C', 'D'];
const PRAISE = ['Nice one!', 'Spot on!', 'You got it!'];

type Answer = { skill: SkillKey; correct: boolean; right: string };

export default function PracticeScreen() {
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
  const meta = SKILL_META[question.skill];
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
        <IconButton name="x" label="Close practice" onPress={() => router.back()} />
        <ProgressBar
          progress={progress}
          height={ms(12)}
          gradient={['#34C6D3', colors.teal]}
          track="#DFEBED"
          animationDuration={duration.base}
          style={styles.bar}
          accessibilityLabel={`Question ${index + 1} of ${QUESTIONS.length}`}
        />
        <TextComp style={styles.count}>
          {index + 1}/{QUESTIONS.length}
        </TextComp>
      </View>

      <View style={styles.body} key={index}>
        <Animated.View entering={FadeInDown.springify().damping(18)} style={styles.stack}>
          <View style={[styles.skillChip, { backgroundColor: meta.tint }]}>
            <Icon name={meta.icon} size={14} color={meta.color} strokeWidth={2.6} />
            <TextComp style={[styles.skillLabel, { color: meta.color }]}>{meta.label}</TextComp>
          </View>

          <TextComp style={styles.prompt}>
            {question.prompt.length === 2 ? (
              <>
                {question.prompt[0]}
                <TextComp style={styles.gap}>
                  {picked != null ? ` ${question.answers[picked]} ` : '          '}
                </TextComp>
                {question.prompt[1]}
              </>
            ) : (
              question.prompt[0]
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
          entering={SlideInDown.springify().damping(20)}
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
                color={colors.surface}
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
                {isRight ? PRAISE[index % PRAISE.length] : 'Not quite'}
              </TextComp>
              <TextComp
                style={[styles.feedbackBody, { color: isRight ? colors.mintInk : colors.berryInk }]}
              >
                {isRight
                  ? question.why
                  : `Answer: ${question.answers[question.correct]}. ${question.why}`}
              </TextComp>
            </View>
          </View>

          <ButtonComp variant={isRight ? 'ok' : 'no'} onPress={advance}>
            {isLast ? 'Finish' : 'Continue'}
          </ButtonComp>
        </Animated.View>
      ) : (
        <View style={[styles.footer, { paddingBottom: insets.bottom + spacing.lg }]}>
          <ButtonComp onPress={check} disabled={picked == null}>
            Check
          </ButtonComp>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.bg,
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
    color: colors.ink3,
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
    letterSpacing: 0.9,
    textTransform: 'uppercase',
  },
  prompt: {
    fontFamily: fontFamily.displayBold,
    fontSize: ms(25),
    lineHeight: ms(32),
    letterSpacing: -0.5,
    color: colors.ink,
  },
  gap: {
    fontFamily: fontFamily.displayBold,
    fontSize: ms(25),
    lineHeight: ms(32),
    color: colors.teal700,
    textDecorationLine: 'underline',
    textDecorationColor: colors.teal200,
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
    borderColor: colors.line,
    backgroundColor: colors.surface,
  },
  answerSelected: {
    borderColor: colors.teal,
    backgroundColor: colors.selectedCard,
  },
  answerRight: {
    borderColor: colors.mint,
    backgroundColor: colors.mint50,
  },
  answerWrong: {
    borderColor: colors.berry,
    backgroundColor: colors.berry50,
  },
  answerDimmed: {
    opacity: 0.55,
  },
  key: {
    width: ms(28),
    height: ms(28),
    borderRadius: ms(9),
    borderWidth: 2,
    borderColor: colors.line,
    alignItems: 'center',
    justifyContent: 'center',
  },
  keySelected: {
    borderColor: colors.teal,
  },
  keyRight: {
    borderColor: colors.mint,
    backgroundColor: colors.mint,
  },
  keyWrong: {
    borderColor: colors.berry,
    backgroundColor: colors.berry,
  },
  keyText: {
    fontFamily: fontFamily.black,
    fontSize: ms(12.5),
    color: colors.ink3,
  },
  keyTextSelected: {
    color: colors.teal,
  },
  keyTextReveal: {
    color: colors.surface,
  },
  answerText: {
    flex: 1,
    fontFamily: fontFamily.bold,
    fontSize: ms(16),
    color: colors.ink,
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
    backgroundColor: colors.mint50,
  },
  feedbackWrong: {
    backgroundColor: colors.berry50,
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
  },
  feedbackBody: {
    fontFamily: fontFamily.semibold,
    fontSize: ms(14),
    lineHeight: ms(19),
  },
});
