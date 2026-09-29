# Skillio — Home screen

An EdTech app that teaches English to 10–20 year olds. This repo is the frontend take-home: an
onboarding flow, the Home screen it hands off to, a practice session, a celebration, and a speaking
coach that listens to you read. Everything is hardcoded and animated on the UI thread.

Home is the main deliverable. Everything else exists so Home has something honest to show.

---

## Running it

```bash
npm install
npx expo run:ios      # or: npx expo run:android

npx tsc --noEmit      # typecheck
npx expo lint         # lint
```

> **A dev build is required — Expo Go won't work.** Skia draws the confetti and the coach's waveform,
> and `expo-audio` records. Neither ships in Expo Go. After the first `run:ios`, `npx expo start` is
> enough.
>
> **The coach needs a real microphone.** The simulator will ask for permission and then hear nothing.

Expo SDK 57 · React Native 0.86 · React 19. Tested on iOS and Android.

---

## Every state, without touching code

**Long-press the avatar in the Home header** to open the state switcher: jump between flows, fire
seven numbered presets, flip Class / Practice / Skills / Plan independently, or read the live
`HomeData` payload the screen is rendering.

There's a deep link per preset, for scripted screenshots:

```bash
npx uri-scheme open "skillio://home?state=noclass" --ios
# scheduled · noclass · notdone · done · noskills · nolessons · nosub
```

---

## Why Home is ordered this way

The brief lists five things Home must communicate but no order. Mine, top to bottom:

1. **Daily practice** — the one action that moves the student forward today. The only primary CTA on
   the screen, so there's never a question about what to do first.
2. **Class** — the only thing with a *time* attached. Missing it costs money.
3. **Journey** — progress as a road, not a bar. A percentage says how far along you are; a road says
   where you started and what you're walking towards. The student's own avatar rides it.
4. **Skill snapshot** — the diagnostic. Detail you look at once you know what to do.
5. **Rewards** — streak, XP, badges. Deliberately *below* the learning; gamification should support
   the work, not compete with it.
6. **Plan** — lowest priority. Nobody opens a learning app to look at their subscription. It only
   raises its voice when something is wrong.

Smaller calls: numbers count up rather than appear, so the screen reads as something that *changed*.
Empty states keep their shape — no skill data still renders four rings, dashed, with a `?`. Screens
and cards enter on a curve; springs are reserved for object-level feedback, because screen-sized
content that overshoots just reads as wobble.

---

## The speaking coach

`skillSnapshot` has four dimensions and the app only exercised two. Grammar and vocabulary get worked
by the practice flow; **pronunciation and speaking were numbers with nothing behind them.** An app
that scores your pronunciation and never listens to you is grading homework it never set.

So: hold a button, read a line aloud, and the screen tells you which words landed.

**Why not a chat assistant.** That was the first instinct. But a chat tab is the most commoditised UI
on the phone — you'd be judging my bubble list against ChatGPT's, on a brief that's grading animation
and micro-interaction. A voice coach inverts the problem: the feedback is *visual*, so there's
something to design; it can't be a web app, which seems like the point of a React Native test; and
because you're reading a line I chose, there's no off-script input to break it.

**Where it lives.** A floating orb above the tab bar, not a fifth tab. It breathes — a travelling
wave runs around a ring of 46 bars — and carries a nudge that names the sound the next line drills.

**The morph.** The orb and the session are the same object. One full-screen Skia canvas that never
resizes; every bar is a centre, a direction and a half-length in both states. Collapsed, the centres
sit on a circle and point outward. Expanded, they sit on a line and point up. So the ring genuinely
*unrolls* into the waveform instead of cross-fading. Geometry and amplitude are separate shared
values, which is why the orb keeps breathing the whole way across and only starts listening once it
has arrived.

**What's real:** the microphone, the waveform (actual dBFS — it responds to the room), the silence
detection, and the spoken correction (`expo-speech`).

**What isn't:** per-word scoring. Phoneme-level assessment is a paid cloud API with no on-device
option, so verdicts are scripted against the line being read. Each retry lifts every tripped word one
rung, which is truer to how practice works than replaying the same verdict — and means nobody sees
the identical screen twice.

Metering only arrives ~17×/second, so the canvas keeps one sample of headroom and interpolates across
the gap. You get 60fps without inventing amplitude that wasn't there.

**Edge states** — microphone refused gets a designed screen with a route to Settings, not an alert
that dead-ends on "OK". Nothing heard is measured against the take's peak. And a first session with
no skill data *becomes* the baseline and unlocks the snapshot, which is a better answer to the
brief's "no skill data yet" than a greyed-out card.

Lines are pitched at `progress.currentCefrLevel`, so the content responds to the payload.

---

## Fields I added to the payload

The brief's fields are used verbatim. These are the additions:

| Field | Why |
| --- | --- |
| `dailyPractice.topic` · `focusLabel` | "Start practice" is a weak promise. "Small talk that flows, picked for your speaking goal" is a reason. |
| `dailyPractice.questionCount` · `estimatedMinutes` · `xpReward` | Length, effort and reward — the three things a student weighs before tapping. |
| `dailyPractice.result` | Score, accuracy and a per-skill breakdown, computed from real answers. |
| `gamification.*` | The habit loop. Kept below the required sections on purpose. |
| `scheduledClass.time` as ISO | A formatted string can't produce "Today · 6:30 PM" *and* a live countdown. A timestamp can. |

**Edge states express emptiness with values, never by dropping fields.** The one exception is
`scheduledClass`, which the brief itself specifies as nullable.

---

## Structure

```
src/
  app/            expo-router routes — one-line re-exports
  screens/        onboarding/ · home/ · practice/
  components/     common/ brand/ onboarding/ home/ sheets/ coach/ demo/ fx/
  config/         motion tokens (easings, springs, durations, stagger)
  data/           mock payload, questions, class slots, coach lines
  hooks/          useHomeData, useVoiceRecorder, useCountUp, useInView, redux
  lang/           i18n + en · hi · es · fr · ar
  models/         HomeData, onboarding and coach types
  redux/          store + reducers/
  styles/         palette · theme · fontFamily · scaling · tokens
  utils/          date, journey maths, haptics, coach scoring
```

`useHomeData()` is the only place the payload is assembled, so swapping in a real API is one file.

---

## How the animation works

Everything runs on the UI thread through Reanimated 4, using `get()`/`set()` because the React
Compiler is enabled.

- **Sticky header** — one shared value from `useAnimatedScrollHandler`; blur, hairline and scale all
  interpolate off it. No re-renders while scrolling.
- **Journey path** — a two-segment cubic Bézier, sampled once at module load into 101
  equal-arc-length points, so the traveller is positioned by array index with no per-frame maths.
- **Counting numbers** — driven into a read-only `TextInput` via `useAnimatedProps`, so a 1.1 s
  count-up costs zero JS renders.
- **Confetti** — Skia `Atlas`: one canvas, one draw call, 200 pieces solved analytically from a
  single clock.
- **The coach** — one Skia path rebuilt per frame from 46 bars (see above).
- **Reduce Motion** — carried in the motion tokens; idle loops and confetti opt out entirely.

---

## Theming and languages

Both themes ship, persisted, following the system until you touch it. `src/styles/palette.ts` holds
two palettes with identical keys and `makeStyles()` builds each stylesheet once at module load, so
flipping swaps a reference rather than restyling. Tokens like `onAccent` and `inkSurface` are
deliberately *not* themed — they sit on surfaces that don't change, so their text mustn't either.

Five languages: **English, Hindi, Spanish, French, Arabic**, detected on first launch and persisted.
Every string lives in `src/lang/*.json`; options and badges carry ids only, so adding a language never
touches a component. **Practice answers and the coach's lines stay English** — they're the material
being taught. Arabic flips layout direction, which React Native only applies after a restart.

The floating tab bar uses `expo-glass-effect` on iOS 26+, falling back to `expo-blur` everywhere else.
It's the only glass surface in the app, deliberately — it's the one thing that floats over scrolling
content.

---

## Known limitations

- **Dev build required** (Skia, `expo-audio`).
- **The coach's per-word scoring is scripted.** The mic, waveform, silence detection and spoken
  correction are real; the verdicts aren't measured.
- **Nothing is done with the recording** — it's stopped, read for its peak, and left alone. No upload,
  no playback.
- **Learn, Classes and Profile tabs are out of scope** and say so when tapped.
- **No persistence beyond language and theme.** Restarting resets demo state, which is what you want
  when taking screenshots.

---

## On using AI

The brief said AI tools were fair game as long as the design decisions were mine, so: I built this
with **Claude Code** as an implementation partner, leaning on it hardest where the work was
mechanical — migrating components onto themed stylesheets, filling five locale catalogues, and
writing Skia and Reanimated plumbing once I'd decided what it should do.

The decisions were mine, and some were arguments. The coach started as "an AI chat assistant" and
became a voice coach because a chat tab is a weak thing to be judged on. Putting it on a floating orb
rather than behind the skill snapshot is what made the morph possible. The information order on Home,
the payload additions, keeping taught material untranslated, and refusing to pretend the scoring was
real are all mine too.

The things worth reviewing here are judgement calls, not syntax. Why pronunciation and not a chatbot.
Why an orb and not a tab. No model picked those.

---

## Deliverables

- [x] Source (this repo)
- [ ] Screenshots of the key states + onboarding + the coach → `/screenshots`
- [ ] 60–90 s recording: onboarding → Home → practice → celebration → coach
