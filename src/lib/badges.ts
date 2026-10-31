import type { TranslationKey } from '@/i18n/en';

export interface BadgeDef {
  id: string;
  titleKey: TranslationKey;
  descriptionKey: TranslationKey;
  icon: string;
}

export const BADGES: BadgeDef[] = [
  {
    id: 'first-visit',
    titleKey: 'badges.item.first-visit.title',
    descriptionKey: 'badges.item.first-visit.description',
    icon: 'Compass',
  },
  {
    id: 'map-explorer',
    titleKey: 'badges.item.map-explorer.title',
    descriptionKey: 'badges.item.map-explorer.description',
    icon: 'MapPin',
  },
  {
    id: 'food-finder',
    titleKey: 'badges.item.food-finder.title',
    descriptionKey: 'badges.item.food-finder.description',
    icon: 'Utensils',
  },
  {
    id: 'verifier',
    titleKey: 'badges.item.verifier.title',
    descriptionKey: 'badges.item.verifier.description',
    icon: 'CheckCircle2',
  },
  {
    id: 'listener',
    titleKey: 'badges.item.listener.title',
    descriptionKey: 'badges.item.listener.description',
    icon: 'Volume2',
  },
  {
    id: 'field-scribe',
    titleKey: 'badges.item.field-scribe.title',
    descriptionKey: 'badges.item.field-scribe.description',
    icon: 'FileText',
  },
  {
    id: 'qr-sharer',
    titleKey: 'badges.item.qr-sharer.title',
    descriptionKey: 'badges.item.qr-sharer.description',
    icon: 'QrCode',
  },
  {
    id: 'housing-scout',
    titleKey: 'badges.item.housing-scout.title',
    descriptionKey: 'badges.item.housing-scout.description',
    icon: 'Calendar',
  },
  {
    id: 'offline-ready',
    titleKey: 'badges.item.offline-ready.title',
    descriptionKey: 'badges.item.offline-ready.description',
    icon: 'ShieldCheck',
  },
];
