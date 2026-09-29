# Skillio — Home screen

An EdTech app that teaches English to 10–20 year olds. This repo is the frontend take-home: a full
onboarding flow, the Home screen it hands off to, a practice session and a celebration — all
hardcoded, all animated on the UI thread.

The Home screen is the main deliverable. Everything else exists so Home has something honest to show.

---

## Running it

```bash
npm install
npx expo run:ios      # or: npx expo run:android
```

> **A development build is required — Expo Go will not work.** The confetti and the celebration
> backdrop are drawn with `@shopify/react-native-skia`, which is not part of the Expo Go runtime.
> `npx expo run:ios` builds and installs a dev client for you; after that `npx expo start` is enough.

```bash
npx tsc --noEmit      # typecheck
npx expo lint         # lint
```

Tested on Expo SDK 57 / React Native 0.86 / React 19, iOS and Android.

---

## The seven states, without touching code

Home is driven entirely by one payload, so every edge state is reachable at runtime.

**Long-press the avatar in the Home header** (dev builds only) to open the state switcher. It has:

- **Flow** — jump to Onboarding, Home or Practice
- **Key states** — seven numbered presets; each one resets the rest, scrolls to the relevant card and
  pulses a ring around it
- **Backend data** — flip Class, Practice, Skills and Plan independently
- **Live payload** — the exact `HomeData` object the screen is rendering, plus notes on the fields I added

There is also a deep link per preset, for scripted screenshots:

```bash
npx uri-scheme open "skillio://home?state=noclass" --ios
# scheduled · noclass · notdone · done · noskills · nolessons · nosub
```

---

## Why the screen is laid out this way

The brief lists five things Home must communicate but no order. Mine, top to bottom:

1. **Daily practice** — the one action that moves the student forward today. It is the only primary
   CTA on the screen; everything below it is a tonal button, so there is never a question about what
   to do first.
2. **Class** — the only thing with a *time* attached. Missing it costs money, so it sits above
   everything passive.
3. **Journey** — progress as a road, not a bar. A percentage tells you how far along you are; a road
   tells you where you started, where you are and what you are walking towards. The student's own
   avatar rides it.
4. **Skill snapshot** — the diagnostic. Detail you look at when you already know what to do.
5. **Rewards** — streak, XP, badges. Deliberately *below* the learning, because gamification should
   support the work rather than compete with it.
6. **Plan** — lowest priority. Nobody opens a learning app to look at their subscription. It only
   raises its voice when something is wrong (0 lessons, no plan).

A few smaller decisions:

- **One mascot, not a brand.** Buddy is a speech bubble, because the whole product is about getting a
  sentence out. It blinks on a timer and bobs while it waits. Nothing about it, the palette or the
  copy borrows from Duolingo.
- **Numbers count up, they don't appear.** XP, percentages and skill rings animate from a previous
  value, so the screen reads as a thing that changed rather than a thing that loaded.
- **Empty states keep their shape.** No skill data still renders four rings — dashed, with a `?` —
  so you can see what you're missing and there's a button to go get it.
- **Entrances glide, objects pop.** Screens and cards enter on an ease-out curve with a 50 ms
  stagger. Springs are reserved for object-level feedback: a check mark landing, the streak igniting,
  the XP chip flying to the header. Screen-sized content that overshoots just reads as wobble.

---

## Fields I added to the payload

The brief's fields are used verbatim, with the exact names given. These are the additions and why:

| Field | Why |
| --- | --- |
| `dailyPractice.topic` | "Start practice" is a weak promise. "Small talk that flows" is a reason. |
| `dailyPractice.focusLabel` | Lets the card say *why* this practice was chosen: "Picked for your speaking goal, Alex." |
| `dailyPractice.questionCount` · `estimatedMinutes` · `xpReward` | Length, effort and reward up front — the three things a student weighs before tapping. |
| `dailyPractice.result` | Score, accuracy, seconds and a per-skill breakdown. Powers the completed card and the results sheet. Computed from the real answers, not faked. |
| `gamification.streakDays` · `xp` · `level` · `weeklyXp` · `weeklyGoalXp` · `badges` | The habit loop. Kept below the required sections on purpose. |
| `scheduledClass.time` as an ISO local string | A formatted string can't produce "Today · 6:30 PM" *and* a live countdown that flips to "Live now". A timestamp can. |

**Edge states express emptiness with values, never by dropping fields** — the shape of the payload is
constant. The one exception is `scheduledClass`, which the brief itself specifies as nullable.

| State | Payload |
| --- | --- |
| No class | `scheduledClass: null` |
| No skill data | all six `skillSnapshot` values `null` |
| No lessons left | `lessonsRemaining: 0` with `tier: 'Premium'` |
| No active subscription | `tier: null, lessonsRemaining: 0, totalLessons: 0` |
| Practice done | `completedToday: true` with `result` filled in |

---

## Structure

Routing and screens are separate: `src/app` is the router map, `src/screens` is where the work
happens. Everything else follows the same folder conventions as my other projects.

```
src/
  app/            expo-router routes — one-line re-exports, so the route tree stays readable
  screens/        onboarding/ · home/ · practice/
  components/     common/ brand/ onboarding/ home/ sheets/ demo/ fx/
  config/         motion tokens (easings, springs, durations, stagger)
  data/           mock payload, questions, class slots, option lists
  hooks/          useHomeData, useCountUp, useInView, useDayLabel, useNow, typed redux hooks
  lang/           i18n setup + en · hi · es · fr · ar catalogues
  models/         HomeData and the onboarding types
  redux/          store + reducers/ (onboardingSlice, homeSlice)
  styles/         colors · fontFamily · scaling · tokens
  utils/          date, journey path maths, svg, haptics, focus channels
reference/prototype.html   the HTML prototype this was built from
```

`useHomeData()` is the only place the payload is assembled. Screens read it and never touch the
stores directly, so swapping in a real API is one file.

---

## How the animation works

Everything runs on the UI thread through Reanimated 4. Shared values use the `get()` / `set()` API
rather than `.value`, because the project has the React Compiler enabled.

- **Sticky header** — `useAnimatedScrollHandler` feeds one shared value; the blur, the hairline, the
  title scale and the avatar scale all interpolate off it. No re-renders while scrolling.
- **Journey path** — the road is a two-segment cubic Bézier. It's sampled once at module load into
  101 equal-arc-length points, so the traveller can be positioned on the UI thread by array index
  with no per-frame maths and no extra dependency.
- **Counting numbers** — driven into a read-only `TextInput` via `useAnimatedProps`, so a 1.1 s
  count-up costs zero JS renders.
- **Confetti** — Skia `Atlas`: one canvas, one draw call, up to 200 pieces. Positions are solved
  analytically from a single clock, so the worklet never integrates state between frames.
- **Reveal on scroll** — rings, bars and count-ups hold at their start value until the card has
  scrolled far enough up to be worth watching.
- **Reduce Motion** — motion tokens carry `ReduceMotion.System`; the building screen shortens its
  timeline and the confetti and idle loops opt out entirely.

---

## Light and dark

Both themes ship. The moon/sun button in the Home header flips it instantly; the choice is
persisted, and before you touch it the app follows the system appearance.

`src/styles/palette.ts` holds two palettes with identical keys, and `makeStyles()` builds each
stylesheet once per palette at module load — flipping the theme swaps a reference, it does not
rebuild styles. The tokens at the bottom of the palette (`onAccent`, `inkSurface`, `white`,
`sunInk`) are deliberately *not* themed: they sit on surfaces that stay the same in both modes — the
teal practice hero, the sun-yellow XP chip, the dark toast — so their text must stay put too.

Option and skill colours come from the palette by name (`hue`, `hueTint`, `skill`, `skillTint`)
rather than being baked into the data files, so adding a theme never touches `src/data`.

---

## Internationalisation

Five languages: **English, Hindi, Spanish, French, Arabic**. The device language is detected on first
launch, the choice is persisted, and the picker lives on the Welcome screen — the moment a student
actually wants to choose one. In a full app it would also sit in Profile.

- Every user-facing string is in `src/lang/*.json`. Option lists, badges and questions carry ids and
  styling only; copy is looked up by id, so adding a language never touches a component.
- **Practice answers stay in English** — they are the material being taught. Prompts and explanations
  are translated, which is how a real L1-instruction / L2-content app behaves.
- **Teacher names and class subjects are not translated.** They are backend records, and translating
  them would be pretending.
- **Arabic flips layout direction.** React Native only applies RTL after a restart, so switching to or
  from Arabic reloads the app in development and shows a "restart to finish" toast in production.

---

## Liquid glass

The floating tab bar uses `expo-glass-effect` (`GlassView`, `glassEffectStyle="regular"`,
`isInteractive`) on iOS 26 and above. Availability is resolved once at module load via
`isLiquidGlassAvailable()` and `isGlassEffectAPIAvailable()`; everywhere else — older iOS, Android —
it falls back to the `expo-blur` treatment it had before. It is the only surface in the app that uses
glass, deliberately: it is the one element that floats over scrolling content.

---

## Known limitations

- **Dev build required** (Skia). Everything else in the stack runs in Expo Go.
- **The Learn, Classes and Profile tabs are out of scope** and say so when tapped.
- **No persistence beyond language.** Restarting resets the demo state to defaults, which is what you
  want when taking screenshots.
- **The "Manage" link on the plan card** opens the plans sheet rather than a billing screen.
- Liquid glass needs iOS 26; it degrades to blur rather than being feature-detected per-frame.

---

## Deliverables checklist

- [x] Source (this repo)
- [ ] Screenshots of the seven key states + onboarding → `/screenshots`
- [ ] 60–90 s screen recording: onboarding → Home → practice → celebration → state switching
