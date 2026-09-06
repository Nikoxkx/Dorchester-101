import type { SVGProps } from 'react';

/* ─────────────────────────────────────────────────────────────
   DOR101 icon set — hand-drawn 24px stroke glyphs.
   Single-weight linework (1.7px), square caps, no fills, no
   gradients. Every glyph is drawn on a consistent 24 grid so
   the family reads as one set.
   ───────────────────────────────────────────────────────────── */

type P = SVGProps<SVGSVGElement> & { strokeWidth?: number };

function base({ strokeWidth = 1.7, ...rest }: P): SVGProps<SVGSVGElement> {
  return {
    xmlns: 'http://www.w3.org/2000/svg',
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth,
    strokeLinecap: 'square',
    strokeLinejoin: 'miter',
    'aria-hidden': true,
    ...rest,
  };
}

export const HomeIcon = (p: P) => (
  <svg {...base(p)}>
    <path d="M4 11.5 12 4l8 7.5" />
    <path d="M6 10.5V20h12v-9.5" />
    <path d="M10 20v-6h4v6" />
  </svg>
);

export const HousingIcon = (p: P) => (
  <svg {...base(p)}>
    <path d="M3 21h18" />
    <path d="M5 21V10l7-6 7 6v11" />
    <path d="M10 21v-7h4v7" />
    <path d="M9.5 10.5h5" />
  </svg>
);

export const PinIcon = (p: P) => (
  <svg {...base(p)}>
    <path d="M12 21s7-6.1 7-11a7 7 0 1 0-14 0c0 4.9 7 11 7 11Z" />
    <circle cx="12" cy="10" r="2.4" />
  </svg>
);

export const FoodIcon = (p: P) => (
  <svg {...base(p)}>
    <path d="M7 3v8a2.2 2.2 0 0 0 2.2 2.2h0" />
    <path d="M9.2 13.2V21" />
    <path d="M7 21h4.4" />
    <path d="M16.5 21V10.8a3.8 3.8 0 0 1-2.5-3.5V3" />
    <path d="M16.5 3v7.3" />
    <path d="M4.8 8.5A2.3 2.3 0 0 0 7 6.8V3" />
  </svg>
);

export const InfoIcon = (p: P) => (
  <svg {...base(p)}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 11v6" />
    <path d="M12 7.4v.1" />
  </svg>
);

export const CalculatorIcon = (p: P) => (
  <svg {...base(p)}>
    <rect x="5" y="3" width="14" height="18" />
    <path d="M8.5 7h7" />
    <path d="M8.5 12.2h.1M12 12.2h.1M15.5 12.2h.1M8.5 15.5h.1M12 15.5h.1M15.5 15.5h.1M8.5 18.8h.1M12 18.8h.1M15.5 18.8h.1" />
  </svg>
);

export const PaperIcon = (p: P) => (
  <svg {...base(p)}>
    <path d="M6 3h9l4 4v14H6z" />
    <path d="M14.5 3v4.5H19" />
    <path d="M9 12.5h7M9 16h5" />
  </svg>
);

export const BookIcon = (p: P) => (
  <svg {...base(p)}>
    <path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v16.5H6.5A2.5 2.5 0 0 0 4 22Z" />
    <path d="M4 20.5A2.5 2.5 0 0 1 6.5 18H20" />
    <path d="M12 7.2v9.3" />
    <path d="M8.5 9h-2M8.5 12h-2" />
  </svg>
);

export const GridIcon = (p: P) => (
  <svg {...base(p)}>
    <rect x="3.5" y="3.5" width="7" height="7" />
    <rect x="13.5" y="3.5" width="7" height="7" />
    <rect x="3.5" y="13.5" width="7" height="7" />
    <rect x="13.5" y="13.5" width="7" height="7" />
  </svg>
);

export const TrendIcon = (p: P) => (
  <svg {...base(p)}>
    <path d="M3 20h18" />
    <path d="M5 16l5-6 4 3 6-8" />
    <path d="M17 5h3v3" />
  </svg>
);

export const GlobeIcon = (p: P) => (
  <svg {...base(p)}>
    <circle cx="12" cy="12" r="9" />
    <path d="M3.5 12h17" />
    <path d="M12 3a13.5 13.5 0 0 1 0 18 13.5 13.5 0 0 1 0-18Z" />
  </svg>
);

export const MenuIcon = (p: P) => (
  <svg {...base(p)}>
    <path d="M4 6.5h16M4 12h16M4 17.5h16" />
  </svg>
);

export const RefreshIcon = (p: P) => (
  <svg {...base(p)}>
    <path d="M20 12a8 8 0 1 1-2.34-5.66" />
    <path d="M20 3.5V7h-3.5" />
  </svg>
);

export const CheckIcon = (p: P) => (
  <svg {...base(p)}>
    <path d="M4.5 12.5 10 18 19.5 6.5" />
  </svg>
);

export const SearchIcon = (p: P) => (
  <svg {...base(p)}>
    <circle cx="10.5" cy="10.5" r="6.5" />
    <path d="M15.5 15.5 21 21" />
  </svg>
);

export const CloseIcon = (p: P) => (
  <svg {...base(p)}>
    <path d="M6 6l12 12M18 6 6 18" />
  </svg>
);

export const ChevronDownIcon = (p: P) => (
  <svg {...base(p)}>
    <path d="m6 9.5 6 6 6-6" />
  </svg>
);

export const ChevronUpIcon = (p: P) => (
  <svg {...base(p)}>
    <path d="m6 14.5 6-6 6 6" />
  </svg>
);

export const ChevronLeftIcon = (p: P) => (
  <svg {...base(p)}>
    <path d="M14.5 6 8.5 12l6 6" />
  </svg>
);

export const ChevronRightIcon = (p: P) => (
  <svg {...base(p)}>
    <path d="m9.5 6 6 6-6 6" />
  </svg>
);

export const MoreIcon = (p: P) => (
  <svg {...base(p)}>
    <path d="M5 12h.1M12 12h.1M19 12h.1" />
  </svg>
);

export const ArrowRightIcon = (p: P) => (
  <svg {...base(p)}>
    <path d="M4 12h15" />
    <path d="m13.5 6 6 6-6 6" />
  </svg>
);

export const ArrowUpRightIcon = (p: P) => (
  <svg {...base(p)}>
    <path d="M6 18 18 6" />
    <path d="M8.5 6H18v9.5" />
  </svg>
);

export const ExternalIcon = (p: P) => (
  <svg {...base(p)}>
    <path d="M13.5 5H19v5.5" />
    <path d="M19 5l-8.5 8.5" />
    <path d="M18 13.5V19H5V6h5.5" />
  </svg>
);

export const PhoneIcon = (p: P) => (
  <svg {...base(p)}>
    <path d="M7 3.5 5 7a16 16 0 0 0 12 12l3.5-2 1.2 3.4a2 2 0 0 1-2 2.8A19.5 19.5 0 0 1 2.8 6.3a2 2 0 0 1 2.8-2Z" />
  </svg>
);

export const ShieldIcon = (p: P) => (
  <svg {...base(p)}>
    <path d="M12 2.8 20 6v6c0 5.5-3.4 8.7-8 10.2C7.4 20.7 4 17.5 4 12V6Z" />
    <path d="m8.8 12 2.2 2.2 4.3-4.6" />
  </svg>
);

export const BellIcon = (p: P) => (
  <svg {...base(p)}>
    <path d="M6 10a6 6 0 0 1 12 0c0 5 1.6 6.4 1.6 6.4H4.4S6 15 6 10Z" />
    <path d="M10.2 20a2 2 0 0 0 3.6 0" />
  </svg>
);

export const TrashIcon = (p: P) => (
  <svg {...base(p)}>
    <path d="M4.5 6.5h15" />
    <path d="M9 6V4.5h6V6" />
    <path d="M6.5 6.5 7.5 21h9l1-14.5" />
    <path d="M10 11v6M14 11v6" />
  </svg>
);

export const ClockIcon = (p: P) => (
  <svg {...base(p)}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v5.2l3.4 2" />
  </svg>
);

export const FileIcon = (p: P) => (
  <svg {...base(p)}>
    <path d="M6 2.8h7.5L19 8.3v13H6Z" />
    <path d="M13.5 2.8V8.3H19" />
  </svg>
);

export const DownloadIcon = (p: P) => (
  <svg {...base(p)}>
    <path d="M12 4v11" />
    <path d="m7.5 11 4.5 4.5L16.5 11" />
    <path d="M4.5 19.5h15" />
  </svg>
);

export const SunIcon = (p: P) => (
  <svg {...base(p)}>
    <circle cx="12" cy="12" r="4.2" />
    <path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6l1.4 1.4M17 17l1.4 1.4M18.4 5.6 17 7M7 17l-1.4 1.4" />
  </svg>
);

export const MoonIcon = (p: P) => (
  <svg {...base(p)}>
    <path d="M20.5 14.5A8.5 8.5 0 0 1 9.5 3.5a8.5 8.5 0 1 0 11 11Z" />
  </svg>
);

export const MapIcon = (p: P) => (
  <svg {...base(p)}>
    <path d="M9 4 3.5 6.2v13.3L9 17.5l6 2.3 5.5-2.2V4.3L15 6.5Z" />
    <path d="M9 4v13.5M15 6.5V20" />
  </svg>
);

export const RailIcon = (p: P) => (
  <svg {...base(p)}>
    <rect x="4.5" y="4" width="15" height="12.5" />
    <path d="M4.5 11.2h15" />
    <path d="M8.5 4v7.2M15.5 4v7.2" />
    <path d="m7.5 16.5-2 4.5M16.5 16.5l2 4.5" />
  </svg>
);

export const ScalesIcon = (p: P) => (
  <svg {...base(p)}>
    <path d="M12 3v18" />
    <path d="M8.5 21h7" />
    <path d="M4.5 7h15" />
    <path d="m6 4.5-2.8 5.4a2.6 2.6 0 0 0 5.6 0Z" />
    <path d="m18 4.5-2.8 5.4a2.6 2.6 0 0 0 5.6 0Z" />
  </svg>
);

export const DollarIcon = (p: P) => (
  <svg {...base(p)}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 6.5v11" />
    <path d="M15 9.2c0-1.2-1.3-2-3-2s-3 .8-3 2 1 1.7 3 2.1 3 .9 3 2.1-1.3 2-3 2-3-.8-3-2" />
  </svg>
);

export const HelpIcon = (p: P) => (
  <svg {...base(p)}>
    <circle cx="12" cy="12" r="9" />
    <path d="M9.4 9.3a2.7 2.7 0 1 1 3.9 2.5c-.9.5-1.3 1-1.3 2.2" />
    <path d="M12 17.2v.1" />
  </svg>
);

export const BookmarkIcon = (p: P) => (
  <svg {...base(p)}>
    <path d="M6.5 3.5h11V21L12 17 6.5 21Z" />
  </svg>
);

export const LanguagesIcon = (p: P) => (
  <svg {...base(p)}>
    <path d="M3.5 5.5h10M8.5 3.5v2M6.8 5.5a8.5 8.5 0 0 0 3.7 6.8M5.8 8.2a10.8 10.8 0 0 0 4.7 4.1" />
    <path d="M9.5 12.3 13 5.5M14.5 20.5l1.2-3h4.6l1.2 3" />
    <path d="M15.9 14.2l1.4-3.6 1.4 3.6" />
  </svg>
);

export const SettingsIcon = (p: P) => (
  <svg {...base(p)}>
    <path d="M12 8.3a3.7 3.7 0 1 0 0 7.4 3.7 3.7 0 0 0 0-7.4Z" />
    <path d="M12 2.8v2.6M12 18.6v2.6M21.2 12h-2.6M5.4 12H2.8M18.5 5.5 16.6 7.4M7.4 16.6l-1.9 1.9M18.5 18.5l-1.9-1.9M7.4 7.4 5.5 5.5" />
  </svg>
);

/* Compass for the map toolbar */
export const CompassIcon = (p: P) => (
  <svg {...base(p)}>
    <circle cx="12" cy="12" r="9" />
    <path d="m15.5 8.5-2 5-5 2 2-5Z" />
  </svg>
);

/** Building facade */
export const BuildingIcon = (p: P) => (
  <svg {...base(p)}>
    <path d="M4 21V4.8L12 3v18" />
    <path d="M12 21h8V9l-8-1.6" />
    <path d="M8 8h.1M8 12h.1M8 16h.1M15.5 12.5h.1M15.5 16h.1M15.5 19.5h.1" />
  </svg>
);

export const AlertTriangleIcon = (p: P) => (
  <svg {...base(p)}>
    <path d="M12 4 2.8 20h18.4Z" />
    <path d="M12 10v4.4" />
    <path d="M12 17.4v.1" />
  </svg>
);

/* ─────────────────────────────────────────────────────────────
   Lucide-compatible aliases (legacy import names → this set).
   ───────────────────────────────────────────────────────────── */
export const AlertTriangle = AlertTriangleIcon;
export const Apple = FoodIcon;
export const ArrowRight = ArrowRightIcon;
export const ArrowUpRight = ArrowUpRightIcon;
export const Bell = BellIcon;
export const Bookmark = BookmarkIcon;
export const BookOpen = BookIcon;
export const Building = BuildingIcon;
export const Building2 = BuildingIcon;
export const Calculator = CalculatorIcon;
export const Check = CheckIcon;
export const CheckCircle2 = CheckIcon;
export const ChevronDown = ChevronDownIcon;
export const ChevronLeft = ChevronLeftIcon;
export const ChevronRight = ChevronRightIcon;
export const ChevronUp = ChevronUpIcon;
export const Clock = ClockIcon;
export const Close = CloseIcon;
export const DollarSign = DollarIcon;
export const Download = DownloadIcon;
export const ExternalLink = ExternalIcon;
export const FileText = FileIcon;
export const Globe = GlobeIcon;
export const HelpCircle = HelpIcon;
export const Home = HomeIcon;
export const Info = InfoIcon;
export const Languages = LanguagesIcon;
export const Map = MapIcon;
export const Menu = MenuIcon;
export const Moon = MoonIcon;
export const MoreHorizontal = MoreIcon;
export const Navigation = CompassIcon;
export const Newspaper = PaperIcon;
export const Phone = PhoneIcon;
export const PhoneCall = PhoneIcon;
export const RefreshCw = RefreshIcon;
export const Scale = ScalesIcon;
export const Search = SearchIcon;
export const Settings = SettingsIcon;
export const ShieldCheck = ShieldIcon;
export const Sun = SunIcon;
export const TrainFront = RailIcon;
export const Trash2 = TrashIcon;
export const TrendingUp = TrendIcon;
export const X = CloseIcon;

/** Icon lookup used by data-driven lists (nav, quick links). */
export const iconFor = (name: string) => {
  switch (name) {
    case 'home': return HomeIcon;
    case 'housing': return HousingIcon;
    case 'food': return FoodIcon;
    case 'map': return MapIcon;
    case 'info': return InfoIcon;
    case 'calculator': return CalculatorIcon;
    case 'paper': return PaperIcon;
    case 'book': return BookIcon;
    case 'grid': return GridIcon;
    case 'trend': return TrendIcon;
    case 'phone': return PhoneIcon;
    case 'rail': return RailIcon;
    case 'scales': return ScalesIcon;
    case 'dollar': return DollarIcon;
    case 'help': return HelpIcon;
    case 'bell': return BellIcon;
    default: return PinIcon;
  }
};
