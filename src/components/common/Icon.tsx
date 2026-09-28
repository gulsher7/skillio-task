import {
  ArrowRight,
  AudioWaveform,
  Bell,
  BookOpen,
  Briefcase,
  Calendar,
  CalendarPlus,
  Check,
  ChevronLeft,
  ChevronRight,
  Clock,
  Compass,
  Crown,
  Flag,
  Flame,
  Gift,
  GraduationCap,
  Headphones,
  House,
  Info,
  List,
  Lock,
  Mic,
  Play,
  Plus,
  Puzzle,
  RefreshCw,
  SlidersHorizontal,
  Sparkles,
  Star,
  Target,
  TrendingUp,
  User,
  Video,
  X,
  Zap,
} from 'lucide-react-native';

import { colors } from '@/styles/colors';
import { ms } from '@/styles/scaling';

const ICONS = {
  arrowRight: ArrowRight,
  bell: Bell,
  book: BookOpen,
  briefcase: Briefcase,
  calendar: Calendar,
  calendarPlus: CalendarPlus,
  cap: GraduationCap,
  check: Check,
  chevronLeft: ChevronLeft,
  chevronRight: ChevronRight,
  clock: Clock,
  compass: Compass,
  crown: Crown,
  flag: Flag,
  flame: Flame,
  gift: Gift,
  headphones: Headphones,
  home: House,
  info: Info,
  list: List,
  lock: Lock,
  mic: Mic,
  play: Play,
  plus: Plus,
  puzzle: Puzzle,
  refresh: RefreshCw,
  skills: Target,
  sliders: SlidersHorizontal,
  sparkle: Sparkles,
  star: Star,
  target: Target,
  trend: TrendingUp,
  user: User,
  video: Video,
  wave: AudioWaveform,
  x: X,
  bolt: Zap,
} as const;

export type IconName = keyof typeof ICONS;

/** These read as solid shapes in the design, not outlines. */
const SOLID: IconName[] = ['flame', 'bolt', 'play', 'crown', 'star'];

type Props = {
  name: IconName;
  size?: number;
  color?: string;
  strokeWidth?: number;
  solid?: boolean;
};

export default function Icon({ name, size = 22, color = colors.ink, strokeWidth, solid }: Props) {
  const Glyph = ICONS[name];
  const filled = solid ?? SOLID.includes(name);
  return (
    <Glyph
      size={ms(size)}
      color={color}
      fill={filled ? color : 'none'}
      strokeWidth={strokeWidth ?? (filled ? 1.6 : 2.2)}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  );
}
