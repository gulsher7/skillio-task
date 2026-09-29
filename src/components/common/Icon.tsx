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
  Globe,
  GraduationCap,
  Headphones,
  House,
  Info,
  List,
  Lock,
  Mic,
  Moon,
  Play,
  Plus,
  Puzzle,
  RefreshCw,
  SlidersHorizontal,
  Sparkles,
  Star,
  Sun,
  Target,
  TrendingUp,
  User,
  Video,
  X,
  Zap,
} from 'lucide-react-native';

import { ms } from '@/styles/scaling';
import { useColors } from '@/styles/theme';

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
  globe: Globe,
  headphones: Headphones,
  home: House,
  info: Info,
  list: List,
  lock: Lock,
  mic: Mic,
  moon: Moon,
  play: Play,
  plus: Plus,
  puzzle: Puzzle,
  refresh: RefreshCw,
  skills: Target,
  sliders: SlidersHorizontal,
  sparkle: Sparkles,
  star: Star,
  sun: Sun,
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

export default function Icon({ name, size = 22, color, strokeWidth, solid }: Props) {
  const colors = useColors();
  const Glyph = ICONS[name];
  const filled = solid ?? SOLID.includes(name);
  return (
    <Glyph
      size={ms(size)}
      color={color ?? colors.ink}
      fill={filled ? (color ?? colors.ink) : 'none'}
      strokeWidth={strokeWidth ?? (filled ? 1.6 : 2.2)}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  );
}
