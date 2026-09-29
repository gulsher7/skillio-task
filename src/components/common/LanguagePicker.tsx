import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { DevSettings, View } from 'react-native';

import { LANGUAGES, setLanguage, type Language } from '@/lang';
import { fontFamily } from '@/styles/fontFamily';
import { ms } from '@/styles/scaling';
import { makeStyles, useColors } from '@/styles/theme';
import { radius, spacing } from '@/styles/tokens';

import Icon from './Icon';
import PressableScale from './PressableScale';
import Sheet from './Sheet';
import TextComp from './TextComp';
import { showToast } from './Toast';

/** The list itself, so Welcome and Home can both raise it in a bottom sheet. */
export function LanguageSheet({ onDone }: { onDone: () => void }) {
  const styles = useStyles();
  const colors = useColors();
  const { t, i18n } = useTranslation();

  const current = i18n.language as Language;

  const choose = async (language: Language) => {
    if (language === current) {
      onDone();
      return;
    }

    const needsRestart = await setLanguage(language);
    onDone();

    if (!needsRestart) return;
    // Flipping to or from Arabic changes layout direction, which React Native
    // only picks up on a fresh start.
    if (__DEV__) {
      setTimeout(() => DevSettings.reload(), 400);
    } else {
      showToast('Restart the app to finish switching direction', 'refresh');
    }
  };

  return (
    <View style={styles.list}>
      <TextComp variant="h2">{t('common.language')}</TextComp>
      {LANGUAGES.map((language) => {
        const active = language === current;
        return (
          <PressableScale
            key={language}
            haptic="select"
            scaleTo={0.98}
            onPress={() => choose(language)}
            accessibilityRole="radio"
            accessibilityState={{ selected: active }}
            style={[styles.row, active ? styles.rowActive : null]}
          >
            <TextComp style={styles.rowLabel}>{t(`languages.${language}`)}</TextComp>
            {active ? <Icon name="check" size={18} color={colors.teal} strokeWidth={3} /> : null}
          </PressableScale>
        );
      })}
    </View>
  );
}

/**
 * The pill on Welcome — the moment a student actually wants to pick a language.
 * Home raises the same sheet from its globe button.
 */
export default function LanguagePicker() {
  const styles = useStyles();
  const colors = useColors();
  const { t, i18n } = useTranslation();
  const [open, setOpen] = useState(false);

  return (
    <>
      <PressableScale
        onPress={() => setOpen(true)}
        scaleTo={0.94}
        accessibilityRole="button"
        accessibilityLabel={t('common.language')}
        style={styles.trigger}
      >
        <Icon name="globe" size={16} color={colors.teal700} />
        <TextComp style={styles.triggerText}>{t(`languages.${i18n.language}`)}</TextComp>
      </PressableScale>

      {open ? (
        <Sheet onClose={() => setOpen(false)} label={t('common.language')}>
          {(close) => <LanguageSheet onDone={close} />}
        </Sheet>
      ) : null}
    </>
  );
}

const useStyles = makeStyles((c) => ({
  trigger: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: ms(6),
    paddingHorizontal: ms(12),
    paddingVertical: ms(8),
    borderRadius: radius.pill,
    backgroundColor: c.teal50,
  },
  triggerText: {
    fontFamily: fontFamily.black,
    fontSize: ms(13),
    lineHeight: ms(16.9),
    color: c.teal700,
  },
  list: {
    gap: spacing.md,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: ms(14),
    paddingHorizontal: spacing.base,
    borderRadius: radius.option,
    borderWidth: 2,
    borderColor: c.line,
  },
  rowActive: {
    borderColor: c.teal,
    backgroundColor: c.selectedCard,
  },
  rowLabel: {
    fontFamily: fontFamily.bold,
    fontSize: ms(16),
    lineHeight: ms(20.8),
    color: c.ink,
  },
}));
