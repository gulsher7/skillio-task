# Skillio — Home screen

An EdTech app that teaches English to 10–20 year olds. This repo is the frontend take-home: a full
onboarding flow, the Home screen it hands off to, a practice session, a celebration, and a speaking
coach that listens to you read — all hardcoded, all animated on the UI thread.

The Home screen is the main deliverable. Everything else exists so Home has something honest to show.

---

## Running it

```bash
npm install
npx expo run:ios      # or: npx expo run:android
```

> **A development build is required — Expo Go will not work.** The confetti, the celebration backdrop
> and the coach's waveform are drawn with `@shopify/react-native-skia`, and the coach records through
> `expo-audio`; neither is part of the Expo Go runtime. `npx expo run:ios` builds and installs a dev
> client for you; after that `npx expo start` is enough.

> **The coach needs a microphone.** The simulator will ask for permission and then hear nothing, which
> is a state worth seeing but not the one to judge it on. Use a device.

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

## The speaking coach

The second brief said to go all out, so I built the thing the payload was already asking for.

`skillSnapshot` has four dimensions and the app only ever touched two of them. Grammar and vocabulary
get exercised by the practice flow; **pronunciation and speaking were numbers with nothing behind
them.** That's the hole. An app that scores you on pronunciation and then never listens to you is
grading homework it never set.

So: hold a button, read a line out loud, and the screen tells you which words landed.

### Why not a chat assistant

That was my first instinct and I talked myself out of it. A chat tab is the most commoditised UI on
the phone right now — you'd be judging my bubble list against ChatGPT's, on a brief that says it's
grading animation and micro-interaction. There's almost nothing to design in it. Worse, a mocked
assistant breaks the moment someone types something off-script, and a real one means shipping an API
key in a take-home repo.

A voice coach inverts all three problems. The feedback is *visual*, so there's something to build.
It can't be a web app, which seems like the point of a React Native test. And because you're reading
a line **I** chose, the input is bounded by design — there is no off-script.

### Where it lives

A floating orb above the tab bar, not a fifth tab. Learn, Classes and Profile are already out of
scope and a fourth dead tab wouldn't have helped.

The orb is not a button with a sparkle on it. It breathes — a travelling wave runs around a ring of
46 bars at 0.55 Hz, so there's one living thing on an otherwise still screen. It carries a nudge that
peeks out and collapses again, and the nudge is never generic: with no pronunciation data it asks for
a baseline, otherwise it names the sound the next line drills. It ducks to 72% and fades back when
you scroll past 24 px, and returns the instant you scroll up.

### The morph

This is the part I actually care about, and it's the reason it's an orb and not a screen push.

The orb and the session are **the same object**. `VoiceCanvas` keeps a single full-screen Skia canvas
that never resizes — only what it draws moves. Every bar is described the same way in both states: a
centre point, a direction, and a half-length. Collapsed, the centres sit on a circle and point
outward. Expanded, they sit on a line and point up. So morphing is interpolating those three things,
and the ring in the corner genuinely *unrolls* into the waveform rather than one cross-fading into
the other. 620 ms out, 520 ms back.

Amplitude is a second, independent axis. `morph` moves the geometry; `live` blends the idle breathing
into the microphone. That separation is what lets the orb keep breathing the whole way across and
only start listening once it has arrived — which is the detail that sells it as one continuous object.

It's one path, one draw call, one worklet. Same approach as the confetti.

### What's real and what isn't

Worth being blunt about this, because the line matters.

| | |
| --- | --- |
| Microphone recording | **Real.** `expo-audio`, `RecordingPresets.LOW_QUALITY` with metering on. |
| The waveform | **Real.** Driven by actual dBFS from the mic. It responds to the room. |
| Speaking the correction back | **Real.** `expo-speech`, en-GB at 0.78 rate. |
| "We couldn't hear you" | **Real.** Measured against the take's peak. |
| **Per-word pronunciation scoring** | **Scripted.** Phoneme-level assessment is a paid cloud API (Azure and friends); there is no on-device option. |

The metering only arrives about **17 times a second**, which is nowhere near enough to draw at 60fps.
So the canvas keeps one sample of headroom and tracks how far it is between the last two reads, then
interpolates across the gap. You get continuous motion without inventing amplitude that wasn't there.
The dB floor is set at −48, not the theoretical −160, because otherwise every normal speaking voice
maps to the top two pixels of the waveform.

Scoring is scripted against the line being read, and `src/data/coachLines.ts` marks where a first read
is expected to slip. Since the learner is reading a sentence I picked, this holds up in a way a
scripted chat reply never would.

**Retries actually improve.** Each retry lifts every tripped word one rung — missed becomes close,
close becomes good. That's truer to how pronunciation practice works than replaying the same verdict,
it makes the retry button worth pressing, and it means nobody sees the identical screen three times
in a row. Only your best take of each line counts toward the session.

### The details that took the longest

- **The resolve sweeps, it doesn't pop.** Words settle left to right off one shared value, 58 ms per
  word, each with a small drop as it lands. This single thing is the difference between "the screen
  animated" and "something listened to me."
- **A miss has somewhere to go.** The failed word lifts, shows its IPA against what you probably said,
  and speaks itself — timed to land *after* the sweep reaches it, so you hear it while looking at it.
- **The score goes home.** Finishing scrolls Home to the skill snapshot, pulses the ring and toasts
  the delta. A number that changes off screen may as well not have changed.
- A session nudges pronunciation 35% of the way toward what you just read, so one good morning can't
  rewrite the skill outright.

### Edge states

The brief asks for these twice, and this feature has three good ones:

| State | What happens |
| --- | --- |
| Microphone refused | A designed screen with a route to Settings. The system prompt only appears once, so an alert that dead-ends on "OK" would be a trap. |
| Nothing heard | Measured, not guessed — the take's peak stayed under the floor. Tells you to hold the button down and find somewhere quiet. |
| No skill data yet | The session **becomes** the baseline and unlocks the snapshot. Reading aloud is itself evidence of a skill, so throwing it away because there was no prior number would be silly. |

That last one is the honest answer to "no skill data yet" in the bonus list — better than a greyed-out
card, because the empty state does something about being empty.

Lines are pitched at `progress.currentCefrLevel` and topped up from neighbouring levels, so the
content visibly responds to the payload rather than ignoring it.

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
  components/     common/ brand/ onboarding/ home/ sheets/ coach/ demo/ fx/
  config/         motion tokens (easings, springs, durations, stagger)
  data/           mock payload, questions, class slots, option lists, coach lines
  hooks/          useHomeData, useVoiceRecorder, useCountUp, useInView, useDayLabel, useNow, redux
  lang/           i18n setup + en · hi · es · fr · ar catalogues
  models/         HomeData, the onboarding types, the coach types
  redux/          store + reducers/ (onboardingSlice, homeSlice)
  styles/         palette · colors · fontFamily · scaling · tokens · theme
  utils/          date, journey path maths, svg, haptics, focus channels, coach scoring
reference/prototype.html   the HTML prototype this was built from
```

`useHomeData()` is the only place the payload is assembled. Screens read it and never touch the
stores directly, so swapping in a real API is one file.

The coach is the one feature with enough moving parts to be worth mapping:

```
components/coach/
  CoachLayer.tsx      owns the phase machine, the shared values and the geometry
  CoachOrb.tsx        the glass disc, the nudge, the ducking
  VoiceCanvas.tsx     one Skia canvas — the ring and the waveform it becomes
  CoachSession.tsx    the expanded card; the waveform band is a deliberate hole
  WordLine.tsx        the per-word settle
  CoachSummary.tsx    the score, and the delta that flies home
  CoachDenied.tsx     microphone refused
hooks/useVoiceRecorder.ts   expo-audio, metering, the 17 Hz → 60fps bridge
utils/coachScore.ts         verdicts, retries, and what goes back to the skill
data/coachLines.ts          the lines, by CEFR level, and where a first read slips
```

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
- **The coach's orb and waveform** — one Skia path rebuilt per frame from 46 bars, each described as
  a centre, a direction and a half-length so the ring can interpolate into the waveform. Geometry and
  amplitude are separate shared values, which is why the orb keeps breathing while it travels.
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
- **Practice answers and the coach's lines stay in English** — they are the material being taught.
  Prompts, hints and explanations are translated, which is how a real L1-instruction / L2-content app
  behaves. The IPA stays put too; it isn't English, it's notation.
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

- **Dev build required** (Skia, `expo-audio`). Everything else in the stack runs in Expo Go.
- **The coach's per-word scoring is scripted**, for the reasons above. The microphone, the waveform,
  the silence detection and the spoken correction are all real; the verdicts are not measured.
- **Nothing is done with the recording.** It is stopped, read for its peak, and left alone — there is
  no upload and no playback of your own voice. A real version would either send the audio to a
  scoring API or run one on device, and that changes the privacy story enough to want saying out loud.
- **The Learn, Classes and Profile tabs are out of scope** and say so when tapped.
- **No persistence beyond language and theme.** Restarting resets the demo state to defaults, which is
  what you want when taking screenshots. That includes a coach session — the score it wrote is gone.
- **The "Manage" link on the plan card** opens the plans sheet rather than a billing screen.
- Liquid glass needs iOS 26; it degrades to blur rather than being feature-detected per-frame.

---

## On using AI

The brief said AI tools were fair game as long as the design decisions were mine, so here is the
honest version.

I built this with **Claude Code** as an implementation partner, and used it hardest where the work was
mechanical: migrating every component onto the themed stylesheets, filling out five locale
catalogues, and writing the Skia and Reanimated plumbing once I'd decided what it should do.

The decisions were mine, and a few of them were arguments. The coach started as "an AI chat
assistant" and became a voice coach because a chat tab is a weak thing to be judged on — that
exchange is most of why the feature is what it is. Putting it on a floating orb rather than behind
the skill snapshot was my call, and it's what made the morph possible. The information order on Home,
the payload additions, the choice to keep the taught material untranslated, and the decision not to
pretend the scoring was real are all mine too.

Where I'd point a sceptical reviewer: the things worth looking at here are judgement calls, not
syntax. Why pronunciation and not a chatbot. Why an orb and not a tab. Why the scoring is honest
about being scripted instead of quietly implying an API. No model picked those.

---

## Deliverables checklist

- [x] Source (this repo)
- [ ] Screenshots of the seven key states + onboarding + the coach → `/screenshots`
- [ ] 60–90 s screen recording: onboarding → Home → practice → celebration → coach → state switching
